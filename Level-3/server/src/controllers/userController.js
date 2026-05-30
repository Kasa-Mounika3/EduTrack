const Parent = require('../models/Parent');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
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
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const roleModels = {
  student: Student,
  teacher: Teacher,
  parent: Parent
};

const profileFields = {
  admin: ['profilePhoto', 'employeeId', 'name', 'email', 'phone', 'position'],
  teacher: ['profilePhoto', 'teacherId', 'name', 'email', 'phone', 'department', 'subjects', 'qualification', 'experience'],
  student: [
    'profilePhoto',
    'studentId',
    'firstName',
    'lastName',
    'gender',
    'dateOfBirth',
    'email',
    'phone',
    'alternatePhone',
    'address',
    'city',
    'state',
    'country',
    'course',
    'department',
    'year',
    'semester',
    'admissionDate',
    'parentName',
    'parentRelationship',
    'parentPhone',
    'parentEmail'
  ],
  parent: ['profilePhoto', 'name', 'email', 'phone', 'relationship', 'children']
};

const calculateCompletion = (role, user, roleProfile) => {
  const fields = profileFields[role] || profileFields.student;
  const source = { ...user.toObject?.(), ...roleProfile?.toObject?.() };
  const filled = fields.filter((field) => {
    const value = source[field];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }).length;

  return Math.round((filled / fields.length) * 100);
};

const getRoleProfile = async (user) => {
  if (user.role === 'student') {
    return Student.findOne({ userAccount: user._id })
      .populate('course', 'courseName courseCode instructor description')
      .populate('parent', 'name email phone relationship');
  }

  if (user.role === 'teacher') {
    return Teacher.findOne({ userAccount: user._id });
  }

  if (user.role === 'parent') {
    return Parent.findOne({ userAccount: user._id }).populate('children', 'studentName email profilePhoto attendance marks');
  }

  return null;
};

const splitAllowedFields = (payload, userRole) => {
  const userFields = ['name', 'email', 'phone', 'employeeId', 'position'];
  const allowedRoleFields = {
    student: [
      'studentName',
      'profilePhoto',
      'studentId',
      'firstName',
      'lastName',
      'gender',
      'dateOfBirth',
      'email',
      'phone',
      'alternatePhone',
      'address',
      'city',
      'state',
      'country',
      'department',
      'year',
      'semester',
      'admissionDate',
      'parentName',
      'parentRelationship',
      'parentPhone',
      'parentEmail'
    ],
    teacher: ['name', 'profilePhoto', 'teacherId', 'email', 'phone', 'department', 'subjects', 'qualification', 'experience'],
    parent: ['name', 'profilePhoto', 'email', 'phone', 'relationship']
  };

  const userUpdates = {};
  const roleUpdates = {};

  Object.keys(payload).forEach((key) => {
    if (userFields.includes(key)) userUpdates[key] = payload[key];
    if (allowedRoleFields[userRole]?.includes(key)) roleUpdates[key] = payload[key];
  });

  return { userUpdates, roleUpdates };
};

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } })
    .select('name email role profilePhoto')
    .sort({ name: 1 });

  const onlineUsers = req.app.get('onlineUsers');
  const onlineIds = onlineUsers ? Array.from(onlineUsers.keys()) : [];

  sendSuccess(res, 200, 'Users fetched successfully', users, {
    onlineUsers: onlineIds
  });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const roleProfile = await getRoleProfile(req.user);

  sendSuccess(res, 200, 'Profile fetched successfully', {
    user: sanitizeUser(req.user),
    roleProfile,
    completion: calculateCompletion(req.user.role, req.user, roleProfile),
    activity: [
      { label: 'Profile opened', timestamp: new Date() },
      { label: 'Account created', timestamp: req.user.createdAt },
      { label: 'Last profile update', timestamp: req.user.updatedAt }
    ]
  });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  if (req.file) req.body.profilePhoto = getUploadedProfilePath(req);
  if (req.body.removeProfilePhoto === 'true') req.body.profilePhoto = '';
  const { userUpdates, roleUpdates } = splitAllowedFields(req.body, req.user.role);
  if (req.body.profilePhoto !== undefined) userUpdates.profilePhoto = req.body.profilePhoto;

  if (userUpdates.email) {
    const existingUser = await User.findOne({ email: userUpdates.email, _id: { $ne: req.user._id } });
    if (existingUser) {
      res.status(409);
      throw new Error('Email is already in use');
    }
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, userUpdates, {
    new: true,
    runValidators: true
  });

  const RoleModel = roleModels[req.user.role];

  if (RoleModel && Object.keys(roleUpdates).length > 0) {
    await RoleModel.findOneAndUpdate(
      { userAccount: req.user._id },
      roleUpdates,
      { new: true, runValidators: true }
    );
  }

  const roleProfile = await getRoleProfile(updatedUser);
  req.app.get('io')?.to(`user:${req.user._id}`).emit('profileUpdated', {
    user: sanitizeUser(updatedUser),
    roleProfile
  });

  sendSuccess(res, 200, 'Profile updated successfully', {
    user: sanitizeUser(updatedUser),
    roleProfile,
    completion: calculateCompletion(updatedUser.role, updatedUser, roleProfile)
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current password and new password are required');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user || !(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  sendSuccess(res, 200, 'Password changed successfully');
});

module.exports = {
  getUsers,
  getMyProfile,
  updateMyProfile,
  changePassword
};
