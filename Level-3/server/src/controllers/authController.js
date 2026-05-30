const Parent = require('../models/Parent');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { sendSuccess } = require('../utils/apiResponse');
const { linkStudentToParent } = require('../utils/parentLinking');

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profilePhoto: user.profilePhoto,
  phone: user.phone,
  employeeId: user.employeeId,
  position: user.position,
  createdAt: user.createdAt
});

const getRoleProfile = async (user) => {
  if (user.role === 'student') {
    return Student.findOne({ userAccount: user._id })
      .populate('course', 'courseName courseCode instructor description')
      .populate('parent', 'name email phone relationship')
      .populate({
        path: 'subjectGrades.subjectId',
        populate: { path: 'teacher', select: 'name email teacherName' }
      });
  }

  if (user.role === 'teacher') {
    return Teacher.findOne({ userAccount: user._id })
      .populate('assignedSections', 'sectionName year')
      .populate('assignedSubjects', 'subjectName subjectCode year');
  }

  if (user.role === 'parent') {
    return Parent.findOne({ userAccount: user._id }).populate({
      path: 'children linkedStudents',
      select: 'studentName name email profilePhoto attendance marks subjectGrades course sectionId departmentId year semester',
      populate: [
        { path: 'course', select: 'courseName courseCode instructor' },
        {
          path: 'subjectGrades.subjectId',
          populate: { path: 'teacher', select: 'name email teacherName' }
        }
      ]
    });
  }

  return null;
};

const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    teacherId,
    department,
    departmentId,
    subjects,
    qualification,
    experience,
    course,
    courseId,
    sectionId,
    year,
    studentId,
    parentName,
    parentEmail,
    parentPhone,
    parentRelationship
  } = req.body;
  const allowedRoles = ['admin', 'teacher', 'student', 'parent'];

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(409);
    throw new Error('User already exists with this email');
  }

  const finalRole = allowedRoles.includes(role) ? role : 'student';
  const user = await User.create({
    name,
    email,
    password,
    role: finalRole
  });

  if (finalRole === 'teacher') {
    await Teacher.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          name,
          teacherName: name,
          teacherId: teacherId || '',
          email,
          phone: phone || '',
          department: department || '',
          departmentId: departmentId || undefined,
          subjects: subjects || [],
          qualification: qualification || '',
          experience: experience || '',
          userAccount: user._id,
          createdBy: user._id
        }
      },
      { upsert: true, new: true, runValidators: true }
    );
    req.app.get('io')?.to('announcements').emit('dashboardUpdate', { type: 'teacher:create' });
  }

  if (finalRole === 'parent') {
    await Parent.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          name,
          parentName: name,
          email,
          phone: phone || '',
          relationship: parentRelationship || 'Guardian',
          children: [],
          linkedStudents: [],
          userAccount: user._id,
          createdBy: user._id
        }
      },
      { upsert: true, new: true, runValidators: true }
    );
    req.app.get('io')?.to('announcements').emit('dashboardUpdate', { type: 'parent:create' });
  }

  if (finalRole === 'student') {
    const student = await Student.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          studentName: name,
          name,
          studentId: studentId || '',
          email,
          phone: phone || '',
          course: course || courseId || undefined,
          courseId: courseId || course || undefined,
          departmentId: departmentId || undefined,
          sectionId: sectionId || undefined,
          year: year || '',
          parentName: parentName || '',
          parentRelationship: parentRelationship || '',
          parentEmail: parentEmail || '',
          parentPhone: parentPhone || '',
          userAccount: user._id,
          createdBy: user._id
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    if (parentEmail) {
      await linkStudentToParent({
        student,
        parentName,
        parentEmail,
        parentPhone,
        relationship: parentRelationship,
        createdBy: user._id
      });
    }
    req.app.get('io')?.to('announcements').emit('dashboardUpdate', { type: 'student:create', student });
  }

  sendSuccess(res, 201, 'Registration successful', {
    token: generateToken(user),
    user: sanitizeUser(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  sendSuccess(res, 200, 'Login successful', {
    token: generateToken(user),
    user: sanitizeUser(user)
  });
});

const profile = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Profile fetched successfully', {
    user: sanitizeUser(req.user),
    roleProfile: await getRoleProfile(req.user)
  });
});

module.exports = { register, login, profile };
