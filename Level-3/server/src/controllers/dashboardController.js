const Course = require('../models/Course');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getVisibleStudentQuery = async (user) => {
  if (user.role === 'student') {
    return { userAccount: user._id };
  }

  if (user.role === 'parent') {
    const parent = await Parent.findOne({ userAccount: user._id });
    return { _id: { $in: parent?.children || [] } };
  }

  if (user.role === 'teacher') {
    const teacher = await Teacher.findOne({ userAccount: user._id }).select('assignedSections departmentId');
    if (teacher?.assignedSections?.length) return { sectionId: { $in: teacher.assignedSections } };
    if (teacher?.departmentId) return { departmentId: teacher.departmentId };
    return { _id: null };
  }

  return {};
};

const getDashboardSummary = asyncHandler(async (req, res) => {
  const studentQuery = await getVisibleStudentQuery(req.user);

  const [students, totalStudents, totalTeachers, totalParents, totalCourses, notifications, teacherProfile] = await Promise.all([
    Student.find(studentQuery)
      .populate('course', 'courseName courseCode instructor')
      .populate('parent', 'name email phone')
      .sort({ updatedAt: -1 })
      .limit(8),
    Student.countDocuments(studentQuery),
    req.user.role === 'admin' ? Teacher.countDocuments() : Promise.resolve(null),
    req.user.role === 'admin' ? Parent.countDocuments() : Promise.resolve(null),
    Course.countDocuments(),
    Notification.find({
      $or: [
        { receiver: req.user._id },
        { receiver: null, role: 'all' },
        { receiver: null, role: req.user.role }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(5),
    req.user.role === 'teacher'
      ? Teacher.findOne({ userAccount: req.user._id })
          .populate('assignedSections', 'sectionName year')
          .populate('assignedSubjects', 'subjectName subjectCode year')
      : Promise.resolve(null)
  ]);

  const averageAttendance = students.length
    ? Math.round(students.reduce((total, student) => total + (student.attendance || 0), 0) / students.length)
    : 0;

  const averageMarks = students.length
    ? Math.round(students.reduce((total, student) => total + (student.marks || 0), 0) / students.length)
    : 0;

  const lowAttendance = students.filter((student) => (student.attendance || 0) < 75).length;
  const highPerformers = students.filter((student) => (student.marks || 0) >= 85).length;

  const courseBreakdown = students.reduce((acc, student) => {
    const courseName = student.course?.courseName || 'Unassigned';
    acc[courseName] = (acc[courseName] || 0) + 1;
    return acc;
  }, {});

  sendSuccess(res, 200, 'Dashboard summary fetched successfully', {
    role: req.user.role,
    totals: {
      students: totalStudents,
      teachers: totalTeachers,
      parents: totalParents,
      courses: totalCourses
    },
    analytics: {
      averageAttendance,
      averageMarks,
      lowAttendance,
      highPerformers,
      courseBreakdown: Object.entries(courseBreakdown).map(([label, value]) => ({ label, value }))
    },
    recentStudents: students,
    notifications,
    teacherProfile
  });
});

module.exports = {
  getDashboardSummary
};
