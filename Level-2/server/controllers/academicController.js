const AcademicYear = require('../models/AcademicYear');
const Course = require('../models/Course');
const Department = require('../models/Department');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const listAcademicStructure = asyncHandler(async (req, res) => {
  const [academicYears, departments, sections, subjects] = await Promise.all([
    AcademicYear.find().sort({ createdAt: -1 }),
    Department.find().populate('course', 'courseName courseCode').sort({ departmentName: 1 }),
    Section.find().populate('course', 'courseName courseCode').populate('department', 'departmentName departmentCode').sort({ year: 1, sectionName: 1 }),
    Subject.find().populate('course', 'courseName courseCode').populate('department', 'departmentName').populate('section', 'sectionName year').populate('teacher', 'teacherName email').sort({ subjectName: 1 })
  ]);

  sendSuccess(res, 200, 'Academic structure fetched successfully', {
    academicYears,
    departments,
    sections,
    subjects
  });
});

const createAcademicYear = asyncHandler(async (req, res) => {
  const academicYear = await AcademicYear.create({ ...req.body, createdBy: req.user._id });
  sendSuccess(res, 201, 'Academic year created successfully', academicYear);
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create({ ...req.body, createdBy: req.user._id });
  await Course.findByIdAndUpdate(department.course, { $addToSet: { departments: department._id } });
  sendSuccess(res, 201, 'Department created successfully', department);
});

const createSection = asyncHandler(async (req, res) => {
  const section = await Section.create({ ...req.body, createdBy: req.user._id });
  sendSuccess(res, 201, 'Section created successfully', section);
});

const createSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.create({ ...req.body, createdBy: req.user._id });

  if (subject.teacher) {
    await Teacher.findByIdAndUpdate(subject.teacher, {
      $addToSet: {
        assignedSubjects: subject._id,
        assignedSections: subject.section
      },
      departmentId: subject.department
    });
  }

  sendSuccess(res, 201, 'Subject created successfully', subject);
});

module.exports = {
  listAcademicStructure,
  createAcademicYear,
  createDepartment,
  createSection,
  createSubject
};
