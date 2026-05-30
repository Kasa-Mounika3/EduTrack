const mongoose = require('mongoose');
const { GraphQLError } = require('graphql');
const Course = require('../../models/Course');
const Parent = require('../../models/Parent');
const Student = require('../../models/Student');
const Teacher = require('../../models/Teacher');
const User = require('../../models/User');
const { createRoleAccount } = require('../../utils/accountProvisioning');
const { emitStudentActivity } = require('../../utils/realtimeEvents');
const generateToken = require('../../utils/generateToken');

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const throwGraphQLError = (message, code = 'BAD_USER_INPUT') => {
  throw new GraphQLError(message, {
    extensions: { code }
  });
};

const requireAuth = (user) => {
  if (!user) {
    throwGraphQLError('Authentication required. Please login first.', 'UNAUTHENTICATED');
  }
};

const requireAdmin = (user) => {
  requireAuth(user);

  if (user.role !== 'admin') {
    throwGraphQLError('Admin access required for this action.', 'FORBIDDEN');
  }
};

const requireTeacher = (user) => {
  requireAuth(user);

  if (user.role !== 'teacher') {
    throwGraphQLError('Teacher access required for academic record updates.', 'FORBIDDEN');
  }
};

const assertOwnerOrAdmin = async (user, student) => {
  requireAuth(user);

  if (user.role === 'admin') return;

  if (user.role === 'teacher') {
    const teacher = await Teacher.findOne({ userAccount: user._id }).select('assignedSections departmentId');
    const hasSectionAccess = teacher?.assignedSections?.some((sectionId) => student.sectionId?.equals(sectionId));
    const hasDepartmentAccess = teacher?.departmentId && student.departmentId?.equals(teacher.departmentId);
    if (hasSectionAccess || hasDepartmentAccess) return;
  }

  if (user.role === 'student' && student.userAccount?.equals(user._id)) return;

  if (user.role === 'parent') {
    const parent = await Parent.findOne({ userAccount: user._id, children: student._id });
    if (parent) return;
  }

  if (!student.createdBy?.equals(user._id)) {
    throwGraphQLError('Students can only access their own profile.', 'FORBIDDEN');
  }
};

const validateObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throwGraphQLError(`Invalid ${label} id.`);
  }
};

const getPagination = ({ page = 1, limit = DEFAULT_LIMIT } = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);

  return {
    skip: (safePage - 1) * safeLimit,
    limit: safeLimit
  };
};

const buildStudentQuery = async ({ user, search, course }) => {
  let query = {};

  if (user.role === 'student') {
    query.userAccount = user._id;
  } else if (user.role === 'teacher') {
    const teacher = await Teacher.findOne({ userAccount: user._id }).select('assignedSections departmentId');
    if (teacher?.assignedSections?.length) {
      query.sectionId = { $in: teacher.assignedSections };
    } else if (teacher?.departmentId) {
      query.departmentId = teacher.departmentId;
    } else {
      query._id = null;
    }
  } else if (user.role === 'parent') {
    const parent = await Parent.findOne({ userAccount: user._id });
    query._id = { $in: parent?.children || [] };
  } else if (user.role !== 'admin' && user.role !== 'teacher') {
    query.createdBy = user._id;
  }

  if (search) {
    query.$or = [
      { studentName: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (course) {
    validateObjectId(course, 'course');
    query.course = course;
  }

  return query;
};

const buildCourseQuery = ({ search }) => {
  if (!search) return {};

  return {
    $or: [
      { courseName: { $regex: search, $options: 'i' } },
      { courseCode: { $regex: search, $options: 'i' } },
      { instructor: { $regex: search, $options: 'i' } }
    ]
  };
};

const removeUndefinedFields = (input) => {
  const cleaned = { ...input };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined || cleaned[key] === null) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

const handleDatabaseError = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    throwGraphQLError(`A record with this ${field} already exists.`);
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((item) => item.message);
    throwGraphQLError(messages.join(', '));
  }

  throw error;
};

const populateStudent = (query) => {
  return query
    .populate('course', 'courseName courseCode instructor description')
    .populate('courseId', 'courseName courseCode instructor description')
    .populate('departmentId', 'departmentName departmentCode')
    .populate('sectionId', 'sectionName year')
    .populate('createdBy', 'name email role profilePhoto');
};

const resolvers = {
  Student: {
    studentName: (student) => student.studentName || student.name || 'Student',
    name: (student) => student.name || student.studentName || 'Student'
  },

  Query: {
    me: async (_, __, { user }) => {
      requireAuth(user);
      return user;
    },

    getStudents: async (_, args, { user }) => {
      requireAuth(user);

      const { skip, limit } = getPagination(args);
      const query = await buildStudentQuery({ user, search: args.search, course: args.course });

      return populateStudent(
        Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
      );
    },

    getStudent: async (_, { id }, { user }) => {
      requireAuth(user);
      validateObjectId(id, 'student');

      const student = await populateStudent(Student.findById(id));

      if (!student) {
        throwGraphQLError('Student not found.', 'NOT_FOUND');
      }

      await assertOwnerOrAdmin(user, student);
      return student;
    },

    getCourses: async (_, args, { user }) => {
      requireAuth(user);

      const { skip, limit } = getPagination(args);
      return Course.find(buildCourseQuery(args))
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }
  },

  Mutation: {
    register: async (_, { input }) => {
      try {
        const existingUser = await User.findOne({ email: input.email });

        if (existingUser) {
          throwGraphQLError('User already exists with this email.');
        }

        const user = await User.create({
          name: input.name,
          email: input.email,
          password: input.password,
          role: input.role || 'student'
        });

        if (user.role === 'teacher') {
          await Teacher.findOneAndUpdate(
            { email: user.email },
            {
              $setOnInsert: {
                name: user.name,
                teacherName: user.name,
                email: user.email,
                userAccount: user._id,
                createdBy: user._id
              }
            },
            { upsert: true, new: true, runValidators: true }
          );
        }

        if (user.role === 'parent') {
          await Parent.findOneAndUpdate(
            { email: user.email },
            {
              $setOnInsert: {
                name: user.name,
                parentName: user.name,
                email: user.email,
                relationship: 'Guardian',
                children: [],
                linkedStudents: [],
                userAccount: user._id,
                createdBy: user._id
              }
            },
            { upsert: true, new: true, runValidators: true }
          );
        }

        if (user.role === 'student') {
          await Student.findOneAndUpdate(
            { email: user.email },
            {
              $setOnInsert: {
                studentName: user.name,
                name: user.name,
                email: user.email,
                userAccount: user._id,
                createdBy: user._id
              }
            },
            { upsert: true, new: true, runValidators: true }
          );
        }

        return {
          token: generateToken(user),
          user
        };
      } catch (error) {
        handleDatabaseError(error);
      }
    },

    login: async (_, { input }) => {
      const user = await User.findOne({ email: input.email }).select('+password');

      if (!user || !(await user.matchPassword(input.password))) {
        throwGraphQLError('Invalid email or password.', 'UNAUTHENTICATED');
      }

      user.password = undefined;

      return {
        token: generateToken(user),
        user
      };
    },

    addStudent: async (_, { input }, { user, app }) => {
      requireAdmin(user);

      try {
        const course = await Course.findById(input.course);

        if (!course) {
          throwGraphQLError('Course not found.', 'NOT_FOUND');
        }

        const account = await createRoleAccount({
          name: input.studentName,
          email: input.email,
          role: 'student'
        });

        const student = await Student.create({
          ...removeUndefinedFields({
            ...input,
            name: input.studentName,
            attendance: undefined,
            marks: undefined,
            courseProgress: undefined,
            remarks: undefined,
            resultPublished: undefined
          }),
          userAccount: account.user._id,
          createdBy: user._id
        });

        const populatedStudent = await populateStudent(Student.findById(student._id));
        await emitStudentActivity(app, 'student:create', populatedStudent);

        return populatedStudent;
      } catch (error) {
        handleDatabaseError(error);
      }
    },

    updateStudent: async (_, { id, input }, { user, app }) => {
      requireAdmin(user);
      validateObjectId(id, 'student');

      try {
        const student = await Student.findById(id);

        if (!student) {
          throwGraphQLError('Student not found.', 'NOT_FOUND');
        }

        if (input.course) {
          const course = await Course.findById(input.course);
          if (!course) {
            throwGraphQLError('Course not found.', 'NOT_FOUND');
          }
        }

        const adminUpdates = removeUndefinedFields({
          ...input,
          name: input.studentName,
          attendance: undefined,
          marks: undefined,
          courseProgress: undefined,
          remarks: undefined,
          resultPublished: undefined
        });

        const updatedStudent = await populateStudent(
          Student.findByIdAndUpdate(id, adminUpdates, {
            new: true,
            runValidators: true
          })
        );

        await emitStudentActivity(app, 'student:update', updatedStudent);

        return updatedStudent;
      } catch (error) {
        handleDatabaseError(error);
      }
    },

    updateAttendance: async (_, { id, attendance }, { user, app }) => {
      requireTeacher(user);
      validateObjectId(id, 'student');

      const student = await Student.findById(id);
      if (!student) throwGraphQLError('Student not found.', 'NOT_FOUND');

      await assertOwnerOrAdmin(user, student);
      student.attendance = attendance;
      await student.save();

      const updatedStudent = await populateStudent(Student.findById(id));
      await emitStudentActivity(app, 'student:attendance', updatedStudent);
      return updatedStudent;
    },

    updateGrades: async (_, { id, marks, courseProgress, remarks, resultPublished }, { user, app }) => {
      requireTeacher(user);
      validateObjectId(id, 'student');

      const student = await Student.findById(id);
      if (!student) throwGraphQLError('Student not found.', 'NOT_FOUND');

      await assertOwnerOrAdmin(user, student);
      if (marks !== undefined) student.marks = marks;
      if (courseProgress !== undefined) student.courseProgress = courseProgress;
      if (remarks !== undefined) student.remarks = remarks;
      if (resultPublished !== undefined) student.resultPublished = resultPublished;
      await student.save();

      const updatedStudent = await populateStudent(Student.findById(id));
      await emitStudentActivity(app, 'student:grades', updatedStudent);
      return updatedStudent;
    },

    deleteStudent: async (_, { id }, { user, app }) => {
      requireAdmin(user);
      validateObjectId(id, 'student');

      const student = await Student.findById(id);

      if (!student) {
        throwGraphQLError('Student not found.', 'NOT_FOUND');
      }

      await student.deleteOne();
      app?.get('io')?.to('announcements').emit('dashboardUpdate', {
        type: 'student:delete',
        studentId: id
      });

      return true;
    },

    addCourse: async (_, { input }, { user }) => {
      requireAdmin(user);

      try {
        return Course.create({
          ...input,
          createdBy: user._id
        });
      } catch (error) {
        handleDatabaseError(error);
      }
    }
  }
};

module.exports = resolvers;
