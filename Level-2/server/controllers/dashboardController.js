const Announcement = require('../models/Announcement');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getDashboard = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({
    audience: {
      $in: req.user.role === 'admin' ? ['all'] : ['all', `${req.user.role}s`]
    }
  })
    .sort({ createdAt: -1 })
    .limit(5);

  if (req.user.role === 'admin') {
    const [students, teachers, parents, courses] = await Promise.all([
      Student.find().populate('course', 'courseName courseCode').sort({ createdAt: -1 }).limit(5),
      Teacher.countDocuments(),
      Parent.countDocuments(),
      Course.countDocuments()
    ]);

    return sendSuccess(res, 200, 'Admin dashboard fetched successfully', {
      role: 'admin',
      stats: {
        students: await Student.countDocuments(),
        teachers,
        parents,
        courses
      },
      recentStudents: students,
      announcements
    });
  }

  if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id })
      .populate('assignedSections', 'sectionName year')
      .populate('assignedSubjects', 'subjectName subjectCode year');
    const studentQuery = teacher?.assignedSections?.length
      ? { sectionId: { $in: teacher.assignedSections.map((section) => section._id) } }
      : teacher?.departmentId
        ? { departmentId: teacher.departmentId }
        : { teacherId: teacher?._id };
    const students = teacher ? await Student.find(studentQuery).populate('course', 'courseName courseCode') : [];

    return sendSuccess(res, 200, 'Teacher dashboard fetched successfully', {
      role: 'teacher',
      teacher,
      students,
      announcements
    });
  }

  if (req.user.role === 'parent') {
    const parent = await Parent.findOne({ user: req.user._id })
      .populate({ path: 'childId', populate: { path: 'course', select: 'courseName courseCode instructor' } })
      .populate({ path: 'linkedStudents', populate: { path: 'course', select: 'courseName courseCode instructor' } });

    return sendSuccess(res, 200, 'Parent dashboard fetched successfully', {
      role: 'parent',
      parent,
      child: parent?.childId || null,
      students: parent?.linkedStudents?.length ? parent.linkedStudents : [parent?.childId].filter(Boolean),
      announcements
    });
  }

  const student = await Student.findOne({ user: req.user._id })
    .populate('course', 'courseName courseCode instructor')
    .populate('teacherId', 'teacherName subject email')
    .populate('parentId', 'parentName email phone');

  return sendSuccess(res, 200, 'Student dashboard fetched successfully', {
    role: 'student',
    student,
    announcements
  });
});

module.exports = {
  getDashboard
};
