const Parent = require('../models/Parent');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { linkStudentToParent } = require('../utils/parentLinking');
const { getUploadedProfilePath } = require('../middleware/uploadMiddleware');

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
    return Student.findOne({ user: user._id }).populate('course', 'courseName courseCode instructor');
  }

  if (user.role === 'teacher') {
    return Teacher.findOne({ user: user._id }).populate('assignedStudents', 'studentName email profilePhoto attendance marks');
  }

  if (user.role === 'parent') {
    return Parent.findOne({ user: user._id })
      .populate('childId', 'studentName name email profilePhoto attendance marks')
      .populate('linkedStudents', 'studentName name email profilePhoto attendance marks');
  }

  return null;
};

// POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    subject,
    course,
    courseId,
    departmentId,
    sectionId,
    year,
    studentId,
    parentName,
    parentEmail,
    parentPhone
  } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(409);
    throw new Error('User already exists with this email');
  }

  const finalRole = ['admin', 'teacher', 'student', 'parent'].includes(role) ? role : 'student';
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
          teacherName: name,
          name,
          email,
          subject: subject || 'Not assigned',
          phone: phone || '',
          user: user._id,
          createdBy: user._id
        }
      },
      { upsert: true, new: true, runValidators: true }
    );
  }

  if (finalRole === 'parent') {
    await Parent.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          parentName: name,
          name,
          email,
          phone: phone || '',
          linkedStudents: [],
          user: user._id,
          createdBy: user._id
        }
      },
      { upsert: true, new: true, runValidators: true }
    );
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
          parentEmail: parentEmail || '',
          parentPhone: parentPhone || '',
          user: user._id,
          createdBy: user._id,
          recentActivity: [
            {
              title: 'Account registered',
              description: 'Student account and academic profile were created.'
            }
          ]
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
        createdBy: user._id
      });
    }
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token: generateToken(user),
    user: sanitizeUser(user)
  });
});

// POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token: generateToken(user),
    user: sanitizeUser(user)
  });
});

// GET /api/auth/profile
const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
    roleProfile: await getRoleProfile(req.user)
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  if (req.file) req.body.profilePhoto = getUploadedProfilePath(req);
  if (req.body.removeProfilePhoto === 'true') req.body.profilePhoto = '';
  const userFields = ['name', 'email', 'phone', 'employeeId', 'position'];
  const userUpdates = {};
  userFields.forEach((field) => {
    if (req.body[field] !== undefined) userUpdates[field] = req.body[field];
  });
  if (req.body.profilePhoto !== undefined) userUpdates.profilePhoto = req.body.profilePhoto;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, userUpdates, {
    new: true,
    runValidators: true
  });

  const roleUpdates = { ...req.body };
  delete roleUpdates.password;
  delete roleUpdates.currentPassword;
  delete roleUpdates.newPassword;

  if (req.user.role === 'student') {
    await Student.findOneAndUpdate({ user: req.user._id }, roleUpdates, { new: true, runValidators: true });
  } else if (req.user.role === 'teacher') {
    await Teacher.findOneAndUpdate({ user: req.user._id }, roleUpdates, { new: true, runValidators: true });
  } else if (req.user.role === 'parent') {
    await Parent.findOneAndUpdate({ user: req.user._id }, roleUpdates, { new: true, runValidators: true });
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: sanitizeUser(updatedUser),
    roleProfile: await getRoleProfile(updatedUser)
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current password and new password are required');
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user || !(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// POST /api/auth/logout
const logoutUser = asyncHandler(async (req, res) => {
  // With localStorage-based JWT auth, logout is handled by deleting the token on the client.
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  logoutUser
};
