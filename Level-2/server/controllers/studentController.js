const mongoose = require('mongoose');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getPagination, getPaginationMeta } = require('../utils/queryFeatures');
const { linkStudentToParent } = require('../utils/parentLinking');
const { getUploadedProfilePath } = require('../middleware/uploadMiddleware');

const isAdmin = (user) => user.role === 'admin';
const isTeacher = (user) => user.role === 'teacher';
const isStudent = (user) => user.role === 'student';
const isParent = (user) => user.role === 'parent';

const buildStudentPassword = (studentName) => {
  const firstName = (studentName || 'student').trim().split(/\s+/)[0].toLowerCase();
  return `${firstName}@12345`;
};

const getOrCreateStudentUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.role !== 'student') {
      const error = new Error('A non-student login account already exists with this email');
      error.statusCode = 409;
      throw error;
    }

    console.log(`[EduTrack] Reusing existing student user for missing profile repair: ${email}`);
    return {
      user: existingUser,
      temporaryPassword: null,
      created: false
    };
  }

  const temporaryPassword = password || buildStudentPassword(name);
  const user = await User.create({
    name,
    email,
    password: temporaryPassword,
    role: 'student'
  });

  console.log(`[EduTrack] User created for student: ${email}`);
  return {
    user,
    temporaryPassword,
    created: true
  };
};

const getRoleScopedStudentQuery = async (user) => {
  if (isAdmin(user)) {
    return {};
  }

  if (isTeacher(user)) {
    const teacher = await Teacher.findOne({ user: user._id }).select('_id assignedSections departmentId');
    if (!teacher) return { _id: null };
    if (teacher.assignedSections?.length) return { sectionId: { $in: teacher.assignedSections } };
    return teacher.departmentId ? { departmentId: teacher.departmentId } : { teacherId: teacher._id };
  }

  if (isParent(user)) {
    const parent = await Parent.findOne({ user: user._id }).select('childId linkedStudents');
    const linkedStudents = parent?.linkedStudents?.length ? parent.linkedStudents : [parent?.childId].filter(Boolean);
    return linkedStudents.length ? { _id: { $in: linkedStudents } } : { _id: null };
  }

  return { user: user._id };
};

const assertStudentAccess = async (req, res, student) => {
  if (isAdmin(req.user)) {
    return;
  }

  if (isTeacher(req.user)) {
    const teacher = await Teacher.findOne({ user: req.user._id }).select('_id assignedSections departmentId');
    if (
      teacher &&
      (
        teacher.assignedSections?.some((sectionId) => sectionId.equals(student.sectionId)) ||
        teacher.departmentId?.equals(student.departmentId) ||
        (student.teacherId && teacher._id.equals(student.teacherId))
      )
    ) {
      return;
    }
  }

  if (isParent(req.user) && await Parent.exists({ user: req.user._id, $or: [{ childId: student._id }, { linkedStudents: student._id }] })) {
    return;
  }

  if (isStudent(req.user) && student.user?.equals?.(req.user._id)) {
    return;
  }

  if (student.createdBy?.equals(req.user._id)) {
    return;
  }

  res.status(403);
  throw new Error('Forbidden: you cannot access this student profile');
};

// GET /api/students
const getStudents = asyncHandler(async (req, res) => {
  if (isAdmin(req.user)) {
    const users = await User.find({ role: 'student' }).select('_id name email phone');
    await Promise.all(users.map((user) => Student.findOneAndUpdate(
      { email: user.email },
      {
        $setOnInsert: {
          studentName: user.name,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          user: user._id,
          createdBy: user._id
        },
      },
      { upsert: true, new: true, runValidators: true }
    ).then((student) => {
      if (student.createdBy?.equals?.(user._id)) {
        console.log(`[EduTrack] Student profile verified/repaired for user: ${user.email}`);
      }
    })));
    await Promise.all(users.map((user) => Student.updateOne(
      { email: user.email, $or: [{ user: { $exists: false } }, { user: null }] },
      { $set: { user: user._id } }
    )));
  }

  const { page, limit, skip } = getPagination(req.query);
  const { search, course } = req.query;
  const query = await getRoleScopedStudentQuery(req.user);

  if (search) {
    query.$or = [
      { studentName: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (course && mongoose.Types.ObjectId.isValid(course)) {
    query.course = course;
  }

  const [students, total] = await Promise.all([
    Student.find(query)
      .populate('course', 'courseName courseCode instructor')
      .populate('courseId', 'courseName courseCode instructor')
      .populate('departmentId', 'departmentName departmentCode')
      .populate('sectionId', 'sectionName year')
      .populate('teacherId', 'teacherName subject email')
      .populate('parentId', 'parentName email phone')
      .populate('user', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Student.countDocuments(query)
  ]);

  sendSuccess(res, 200, 'Students fetched successfully', students, getPaginationMeta(total, page, limit));
});

// GET /api/students/:id
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('course', 'courseName courseCode description instructor')
    .populate('courseId', 'courseName courseCode description instructor')
    .populate('departmentId', 'departmentName departmentCode')
    .populate('sectionId', 'sectionName year')
    .populate('teacherId', 'teacherName subject email user')
    .populate('parentId', 'parentName email phone user')
    .populate('user', 'name email role')
    .populate('createdBy', 'name email role');

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await assertStudentAccess(req, res, student);

  sendSuccess(res, 200, 'Student fetched successfully', student);
});

// POST /api/students
const createStudent = asyncHandler(async (req, res) => {
  const {
    studentName,
    name,
    studentId,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    email,
    course,
    age,
    phone,
    address,
    city,
    state,
    country,
    department,
    year,
    semester,
    admissionDate,
    parentName,
    parentRelationship,
    parentPhone,
    parentEmail,
    teacherId,
    parentId,
    departmentId,
    sectionId,
    password
  } = req.body;

  if (!isAdmin(req.user)) {
    res.status(403);
    throw new Error('Only admins can create student profiles');
  }

  const finalStudentName = studentName || name;
  const studentExists = await Student.findOne({ email });

  if (studentExists) {
    res.status(409);
    throw new Error('A student profile already exists with this email');
  }

  let studentAccount;

  try {
    studentAccount = await getOrCreateStudentUser({
      name: finalStudentName,
      email,
      password
    });

    const student = await Student.create({
      studentName: finalStudentName,
      name: finalStudentName,
      profilePhoto: getUploadedProfilePath(req) || '',
      studentId,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      email,
      course: course || undefined,
      courseId: course || undefined,
      departmentId,
      sectionId,
      age,
      phone,
      address,
      city,
      state,
      country,
      department,
      year,
      semester,
      admissionDate,
      parentName,
      parentRelationship,
      parentPhone,
      parentEmail,
      teacherId,
      parentId,
      user: studentAccount.user._id,
      createdBy: req.user._id,
      recentActivity: [
        {
          title: 'Profile created',
          description: 'Student login account and academic profile were created.'
        }
      ]
    });

    if (teacherId) {
      await Teacher.findByIdAndUpdate(teacherId, { $addToSet: { assignedStudents: student._id } });
    }

    if (parentId) {
      await Parent.findByIdAndUpdate(parentId, {
        $set: { childId: student._id },
        $addToSet: { linkedStudents: student._id }
      });
      console.log(`[EduTrack] Student linked to existing parent: ${email}`);
    } else if (parentEmail) {
      await linkStudentToParent({
        student,
        parentName,
        parentEmail,
        parentPhone,
        createdBy: req.user._id
      });
    }

    console.log(`[EduTrack] Student profile created: ${email}`);

    const populatedStudent = await student.populate([
      { path: 'course', select: 'courseName courseCode instructor' },
      { path: 'teacherId', select: 'teacherName subject email' },
      { path: 'parentId', select: 'parentName email phone' },
      { path: 'user', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' }
    ]);

    sendSuccess(res, 201, 'Student profile and login account created successfully', {
      student: populatedStudent,
      loginCredentials: {
        email,
        temporaryPassword: studentAccount.temporaryPassword
      }
    });
  } catch (error) {
    if (studentAccount?.created) {
      await User.findByIdAndDelete(studentAccount.user._id);
      console.log(`[EduTrack] Rolled back student user after profile creation failed: ${email}`);
    }
    throw error;
  }
});

// PUT /api/students/:id
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await assertStudentAccess(req, res, student);

  const allowedUpdates = {
    studentName: req.body.studentName || req.body.name,
    name: req.body.studentName || req.body.name,
    profilePhoto: req.body.removeProfilePhoto === 'true' ? '' : getUploadedProfilePath(req),
    studentId: req.body.studentId,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    gender: req.body.gender,
    dateOfBirth: req.body.dateOfBirth,
    email: req.body.email,
    course: req.body.course,
    age: req.body.age,
    phone: req.body.phone,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    department: req.body.department,
    year: req.body.year,
    semester: req.body.semester,
    admissionDate: req.body.admissionDate,
    parentName: req.body.parentName,
    parentRelationship: req.body.parentRelationship,
    parentPhone: req.body.parentPhone,
    parentEmail: req.body.parentEmail,
    teacherId: req.body.teacherId,
    parentId: req.body.parentId
    ,
    courseId: req.body.course,
    departmentId: req.body.departmentId,
    sectionId: req.body.sectionId
  };

  Object.keys(allowedUpdates).forEach((key) => {
    if (allowedUpdates[key] === undefined) {
      delete allowedUpdates[key];
    }
  });

  const updatedStudent = await Student.findByIdAndUpdate(req.params.id, allowedUpdates, {
    new: true,
    runValidators: true
  })
    .populate('course', 'courseName courseCode instructor')
    .populate('courseId', 'courseName courseCode instructor')
    .populate('teacherId', 'teacherName subject email')
    .populate('parentId', 'parentName email phone')
    .populate('user', 'name email role')
    .populate('createdBy', 'name email role');

  if (allowedUpdates.teacherId) {
    await Teacher.findByIdAndUpdate(allowedUpdates.teacherId, { $addToSet: { assignedStudents: updatedStudent._id } });
  }

  if (allowedUpdates.parentId) {
    await Parent.findByIdAndUpdate(allowedUpdates.parentId, {
      $set: { childId: updatedStudent._id },
      $addToSet: { linkedStudents: updatedStudent._id }
    });
  } else if (req.body.parentEmail) {
    await linkStudentToParent({
      student: updatedStudent,
      parentName: req.body.parentName,
      parentEmail: req.body.parentEmail,
      parentPhone: req.body.parentPhone,
      createdBy: req.user._id
    });
  }

  sendSuccess(res, 200, 'Student profile updated successfully', updatedStudent);
});

// PATCH /api/students/:id/attendance
const updateAttendance = asyncHandler(async (req, res) => {
  if (!isTeacher(req.user)) {
    res.status(403);
    throw new Error('Only teachers can update attendance');
  }

  const { attendance } = req.body;
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await assertStudentAccess(req, res, student);

  student.attendance = attendance;
  student.recentActivity.unshift({
    title: 'Attendance updated',
    description: `Attendance changed to ${attendance}%.`
  });
  student.recentActivity = student.recentActivity.slice(0, 8);
  await student.save();

  sendSuccess(res, 200, 'Attendance updated successfully', student);
});

// PATCH /api/students/:id/grades
const updateGrades = asyncHandler(async (req, res) => {
  if (!isTeacher(req.user)) {
    res.status(403);
    throw new Error('Only teachers can update grades and academic remarks');
  }

  const { marks, courseProgress, remarks, resultPublished } = req.body;
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await assertStudentAccess(req, res, student);

  if (marks !== undefined) {
    student.marks = marks;
  }

  if (courseProgress !== undefined) {
    student.courseProgress = courseProgress;
  }

  if (remarks !== undefined) {
    student.remarks = remarks;
  }

  if (resultPublished !== undefined) {
    student.resultPublished = resultPublished;
  }

  student.recentActivity.unshift({
    title: 'Academic progress updated',
    description: `Marks: ${student.marks}. Course progress: ${student.courseProgress}%.`
  });
  student.recentActivity = student.recentActivity.slice(0, 8);
  await student.save();

  sendSuccess(res, 200, 'Grades updated successfully', student);
});

// DELETE /api/students/:id
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  if (!isAdmin(req.user)) {
    res.status(403);
    throw new Error('Only admins can delete student profiles');
  }

  await Promise.all([
    student.deleteOne(),
    student.user ? User.findByIdAndDelete(student.user) : Promise.resolve(),
    Teacher.updateMany({ assignedStudents: student._id }, { $pull: { assignedStudents: student._id } }),
    Parent.updateMany({ childId: student._id }, { $unset: { childId: '' } })
  ]);

  sendSuccess(res, 200, 'Student profile deleted successfully');
});

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateAttendance,
  updateGrades,
  deleteStudent
};
