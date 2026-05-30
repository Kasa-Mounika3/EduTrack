const Teacher = require('../models/Teacher');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { createRoleAccount } = require('../utils/accountProvisioning');
const { getPagination, getPaginationMeta } = require('../utils/queryFeatures');
const { getUploadedProfilePath } = require('../middleware/uploadMiddleware');

const buildTeacherQuery = ({ search }) => {
  if (!search) return {};

  return {
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { teacherName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } }
    ]
  };
};

const getTeachers = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    const users = await User.find({ role: 'teacher' }).select('_id name email phone profilePhoto');
    await Promise.all(users.map((user) => Teacher.findOneAndUpdate(
      { email: user.email },
      {
        $setOnInsert: {
          name: user.name,
          teacherName: user.name,
          profilePhoto: user.profilePhoto || '',
          email: user.email,
          phone: user.phone || '',
          userAccount: user._id,
          createdBy: user._id
        },
      },
      { upsert: true, new: true, runValidators: true }
    )));
    await Promise.all(users.map((user) => Teacher.updateOne(
      { email: user.email, $or: [{ userAccount: { $exists: false } }, { userAccount: null }] },
      { $set: { userAccount: user._id } }
    )));
  }

  const { page, limit, skip } = getPagination(req.query);
  await Teacher.updateMany(
    { $or: [{ name: { $exists: false } }, { name: '' }, { name: null }], teacherName: { $exists: true, $nin: ['', null] } },
    [{ $set: { name: '$teacherName' } }]
  );
  await Teacher.updateMany(
    { $or: [{ teacherName: { $exists: false } }, { teacherName: '' }, { teacherName: null }], name: { $exists: true, $nin: ['', null] } },
    [{ $set: { teacherName: '$name' } }]
  );
  const query = req.user.role === 'teacher'
    ? { userAccount: req.user._id }
    : buildTeacherQuery(req.query);

  const [teachers, total] = await Promise.all([
    Teacher.find(query)
      .populate('userAccount', 'name email role')
      .populate('departmentId', 'departmentName departmentCode')
      .populate('assignedSections', 'sectionName year')
      .populate('assignedSubjects', 'subjectName subjectCode year')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Teacher.countDocuments(query)
  ]);

  sendSuccess(res, 200, 'Teachers fetched successfully', teachers, getPaginationMeta(total, page, limit));
});

const createTeacher = asyncHandler(async (req, res) => {
  const account = await createRoleAccount({
    name: req.body.name,
    email: req.body.email,
    role: 'teacher',
    password: req.body.password
  });
  if (account.user.role !== 'teacher') {
    await User.updateOne({ _id: account.user._id }, { role: 'teacher' });
    account.user.role = 'teacher';
  }

  const teacher = await Teacher.create({
    name: req.body.name,
    teacherName: req.body.teacherName || req.body.name,
    profilePhoto: getUploadedProfilePath(req) || '',
    teacherId: req.body.teacherId,
    email: req.body.email,
    phone: req.body.phone,
    department: req.body.department,
    departmentId: req.body.departmentId,
    assignedSections: req.body.assignedSections || [],
    assignedSubjects: req.body.assignedSubjects || [],
    subjects: req.body.subjects || [],
    qualification: req.body.qualification,
    experience: req.body.experience,
    userAccount: account.user._id,
    createdBy: req.user._id
  });

  req.app.get('io')?.to('announcements').emit('dashboardUpdate', {
    type: 'teacher:create',
    teacher
  });

  sendSuccess(res, 201, 'Teacher added successfully', {
    teacher,
    temporaryPassword: account.temporaryPassword
  });
});

const updateTeacher = asyncHandler(async (req, res) => {
  if (req.body.name && !req.body.teacherName) req.body.teacherName = req.body.name;
  if (req.body.teacherName && !req.body.name) req.body.name = req.body.teacherName;
  const updates = {
    ...req.body,
    profilePhoto: req.body.removeProfilePhoto === 'true' ? '' : getUploadedProfilePath(req)
  };
  if (updates.profilePhoto === undefined) delete updates.profilePhoto;

  const teacher = await Teacher.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  sendSuccess(res, 200, 'Teacher updated successfully', teacher);
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  await teacher.deleteOne();
  if (teacher.userAccount) {
    await User.findByIdAndDelete(teacher.userAccount);
  }
  req.app.get('io')?.to('announcements').emit('dashboardUpdate', {
    type: 'teacher:delete',
    teacherId: req.params.id
  });
  sendSuccess(res, 200, 'Teacher removed successfully');
});

module.exports = {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher
};
