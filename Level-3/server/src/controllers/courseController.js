const Course = require('../models/Course');
const Student = require('../models/Student');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getPagination, getPaginationMeta } = require('../utils/queryFeatures');

const getCourses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { courseName: { $regex: search, $options: 'i' } },
      { courseCode: { $regex: search, $options: 'i' } },
      { instructor: { $regex: search, $options: 'i' } }
    ];
  }

  const [courses, total] = await Promise.all([
    Course.find(query).populate('departments', 'departmentName departmentCode').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Course.countDocuments(query)
  ]);

  sendSuccess(res, 200, 'Courses fetched successfully', courses, getPaginationMeta(total, page, limit));
});

const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create({
    courseName: req.body.courseName,
    courseCode: req.body.courseCode,
    instructor: req.body.instructor,
    description: req.body.description,
    createdBy: req.user._id
  });

  sendSuccess(res, 201, 'Course created successfully', course);
});

const getCourseStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({ course: req.params.id })
    .populate('course', 'courseName courseCode')
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, 'Course students fetched successfully', students, {
    total: students.length
  });
});

module.exports = {
  getCourses,
  createCourse,
  getCourseStudents
};
