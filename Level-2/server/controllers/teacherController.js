const Teacher = require('../models/Teacher');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getUploadedProfilePath } = require('../middleware/uploadMiddleware');

const buildTeacherPassword = (teacherName) => {
  const firstName = (teacherName || 'teacher').trim().split(/\s+/)[0].toLowerCase();
  return `${firstName}@12345`;
};

const syncRegisteredTeachers = async () => {
  const users = await User.find({ role: 'teacher' }).select('_id name email phone');
  await Promise.all(users.map((user) => Teacher.findOneAndUpdate(
    { email: user.email },
    {
      $setOnInsert: {
        teacherName: user.name,
        name: user.name,
        email: user.email,
        subject: 'Not assigned',
        phone: user.phone || '',
        user: user._id,
        createdBy: user._id
      },
    },
    { upsert: true, new: true, runValidators: true }
  )));
  await Promise.all(users.map((user) => Teacher.updateOne(
    { email: user.email, $or: [{ user: { $exists: false } }, { user: null }] },
    { $set: { user: user._id } }
  )));
};

const getTeachers = asyncHandler(async (req, res) => {
  await syncRegisteredTeachers();
  await Teacher.updateMany(
    { $or: [{ teacherName: { $exists: false } }, { teacherName: '' }, { teacherName: null }], name: { $exists: true, $nin: ['', null] } },
    [{ $set: { teacherName: '$name' } }]
  );
  await Teacher.updateMany(
    { $or: [{ name: { $exists: false } }, { name: '' }, { name: null }], teacherName: { $exists: true, $nin: ['', null] } },
    [{ $set: { name: '$teacherName' } }]
  );
  const teachers = await Teacher.find()
    .populate('assignedStudents', 'studentName email attendance marks courseProgress')
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, 'Teachers fetched successfully', teachers, { total: teachers.length });
});

const createTeacher = asyncHandler(async (req, res) => {
  const { teacherName, name, email, subject, assignedSections = [], assignedSubjects = [], departmentId, assignedStudents = [], password } = req.body;
  const finalTeacherName = teacherName || name;

  if (!finalTeacherName || !email || !subject) {
    res.status(400);
    throw new Error('Teacher name, email, and subject are required');
  }

  if (await Teacher.exists({ email })) {
    res.status(409);
    throw new Error('A teacher already exists with this email');
  }

  const temporaryPassword = password || buildTeacherPassword(finalTeacherName);
  let teacherUser = await User.findOne({ email });
  let teacherUserCreated = false;
  if (!teacherUser) {
    teacherUser = await User.create({
      name: finalTeacherName,
      email,
      password: temporaryPassword,
      role: 'teacher'
    });
    teacherUserCreated = true;
    console.log(`[EduTrack] User created for teacher: ${email}`);
  } else {
    console.log(`[EduTrack] Reusing existing teacher user: ${email}`);
  }
  if (teacherUser.role !== 'teacher') {
    await User.updateOne({ _id: teacherUser._id }, { role: 'teacher' });
    teacherUser.role = 'teacher';
  }

  try {
    const teacher = await Teacher.create({
      teacherName: finalTeacherName,
      name: finalTeacherName,
      profilePhoto: getUploadedProfilePath(req) || '',
      email,
      subject,
      departmentId,
      assignedSections,
      assignedSubjects,
      assignedStudents,
      user: teacherUser._id,
      createdBy: req.user._id
    });

    if (assignedStudents.length) {
      const Student = require('../models/Student');
      await Student.updateMany({ _id: { $in: assignedStudents } }, { teacherId: teacher._id });
    }
    console.log(`[EduTrack] Teacher profile created: ${email}`);

    const populatedTeacher = await teacher.populate([
      { path: 'assignedSections', select: 'sectionName year department' },
      { path: 'assignedSubjects', select: 'subjectName subjectCode year section' },
      { path: 'user', select: 'name email role' }
    ]);

    sendSuccess(res, 201, 'Teacher profile and login account created successfully', {
      teacher: populatedTeacher,
      loginCredentials: {
        email,
        temporaryPassword
      }
    });
  } catch (error) {
    if (teacherUserCreated) {
      await User.findByIdAndDelete(teacherUser._id);
      console.log(`[EduTrack] Rolled back teacher user after profile creation failed: ${email}`);
    }
    throw error;
  }
});

const updateTeacher = asyncHandler(async (req, res) => {
  const { teacherName, name, subject, assignedSections, assignedSubjects, departmentId } = req.body;
  const updates = {
    teacherName: teacherName || name,
    name: teacherName || name,
    profilePhoto: req.body.removeProfilePhoto === 'true' ? '' : getUploadedProfilePath(req),
    subject,
    departmentId,
    assignedSections,
    assignedSubjects
  };

  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  const teacher = await Teacher.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  }).populate('assignedSections', 'sectionName year department').populate('assignedSubjects', 'subjectName subjectCode');

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

  const Student = require('../models/Student');
  await Promise.all([
    Teacher.findByIdAndDelete(teacher._id),
    User.findByIdAndDelete(teacher.user),
    Student.updateMany({ teacherId: teacher._id }, { $unset: { teacherId: '' } })
  ]);

  sendSuccess(res, 200, 'Teacher deleted successfully');
});

module.exports = {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher
};
