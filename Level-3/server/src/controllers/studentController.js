const mongoose = require('mongoose');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Parent = require('../models/Parent');
const Teacher = require('../models/Teacher');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { createRoleAccount } = require('../utils/accountProvisioning');
const { getPagination, getPaginationMeta } = require('../utils/queryFeatures');
const { emitStudentActivity } = require('../utils/realtimeEvents');
const { linkStudentToParent } = require('../utils/parentLinking');
const User = require('../models/User');
const { getUploadedProfilePath } = require('../middleware/uploadMiddleware');

const isAdmin = (user) => user.role === 'admin';
const isTeacher = (user) => user.role === 'teacher';

const assertAllowedStudentAccess = async (req, res, student) => {
  if (isAdmin(req.user)) return;

  if (isTeacher(req.user)) {
    const teacher = await Teacher.findOne({ userAccount: req.user._id }).select('_id assignedSections departmentId');
    const hasSectionAccess = teacher?.assignedSections?.some((sectionId) => student.sectionId?.equals(sectionId));
    const hasDepartmentAccess = teacher?.departmentId && student.departmentId?.equals(teacher.departmentId);
    if (hasSectionAccess || hasDepartmentAccess) return;
  }

  if (req.user.role === 'student' && student.userAccount?.equals(req.user._id)) return;

  if (req.user.role === 'parent') {
    const parent = await Parent.findOne({ userAccount: req.user._id, children: student._id });
    if (parent) return;
  }

  if (!student.createdBy?.equals(req.user._id)) {
    res.status(403);
    throw new Error('You do not have access to this student record');
  }
};

const buildStudentQuery = async (req) => {
  let query = {};
  const { search, course } = req.query;

  if (req.user.role === 'student') {
    query.userAccount = req.user._id;
  } else if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ userAccount: req.user._id }).select('assignedSections departmentId');
    if (teacher?.assignedSections?.length) {
      query.sectionId = { $in: teacher.assignedSections };
    } else if (teacher?.departmentId) {
      query.departmentId = teacher.departmentId;
    } else {
      query._id = null;
    }
  } else if (req.user.role === 'parent') {
    const parent = await Parent.findOne({ userAccount: req.user._id });
    query._id = { $in: parent?.children || [] };
  } else if (!isAdmin(req.user) && !isTeacher(req.user)) {
    query.createdBy = req.user._id;
  }

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

  return query;
};

const getStudents = asyncHandler(async (req, res) => {
  if (isAdmin(req.user)) {
    const users = await User.find({ role: 'student' }).select('_id name email phone profilePhoto');
    await Promise.all(users.map((user) => Student.findOneAndUpdate(
      { email: user.email },
      {
        $setOnInsert: {
          studentName: user.name,
          name: user.name,
          profilePhoto: user.profilePhoto || '',
          email: user.email,
          phone: user.phone || '',
          userAccount: user._id,
          createdBy: user._id
        },
      },
      { upsert: true, new: true, runValidators: true }
    )));
    await Promise.all(users.map((user) => Student.updateOne(
      { email: user.email, $or: [{ userAccount: { $exists: false } }, { userAccount: null }] },
      { $set: { userAccount: user._id } }
    )));
  }

  const { page, limit, skip } = getPagination(req.query);
  const query = await buildStudentQuery(req);

  const [students, total] = await Promise.all([
    Student.find(query)
      .populate('course', 'courseName courseCode instructor')
      .populate('courseId', 'courseName courseCode instructor')
      .populate('departmentId', 'departmentName departmentCode')
      .populate('sectionId', 'sectionName year')
      .populate('userAccount', 'name email role profilePhoto')
      .populate('parent', 'name email phone')
      .populate('createdBy', 'name email role')
      .populate({
        path: 'subjectGrades.subjectId',
        populate: { path: 'teacher', select: 'name email teacherName' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Student.countDocuments(query)
  ]);

  sendSuccess(res, 200, 'Students fetched successfully', students, getPaginationMeta(total, page, limit));
});

const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('course', 'courseName courseCode instructor description')
    .populate('courseId', 'courseName courseCode instructor description')
    .populate('departmentId', 'departmentName departmentCode')
    .populate('sectionId', 'sectionName year')
    .populate('userAccount', 'name email role profilePhoto')
    .populate('parent', 'name email phone')
    .populate('createdBy', 'name email role')
    .populate({
      path: 'subjectGrades.subjectId',
      populate: { path: 'teacher', select: 'name email teacherName' }
    });

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await assertAllowedStudentAccess(req, res, student);
  sendSuccess(res, 200, 'Student fetched successfully', student);
});

const createStudent = asyncHandler(async (req, res) => {
  const finalStudentName = req.body.studentName || req.body.name;

  if (await Student.exists({ email: req.body.email })) {
    res.status(409);
    throw new Error('A student profile already exists with this email');
  }

  if (req.body.course && !await Course.exists({ _id: req.body.course })) {
    res.status(404);
    throw new Error('Course not found');
  }

  const account = await createRoleAccount({
    name: finalStudentName,
    email: req.body.email,
    role: 'student',
    password: req.body.password
  });

  if (account.user.role !== 'student') {
    const error = new Error('A non-student login account already exists with this email');
    error.statusCode = 409;
    throw error;
  }

  let student;

  try {
    student = await Student.create({
      studentName: finalStudentName,
      name: finalStudentName,
      profilePhoto: getUploadedProfilePath(req) || '',
      studentId: req.body.studentId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      email: req.body.email,
      course: req.body.course,
      courseId: req.body.courseId || req.body.course,
      departmentId: req.body.departmentId,
      sectionId: req.body.sectionId,
      age: req.body.age,
      phone: req.body.phone,
      alternatePhone: req.body.alternatePhone,
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
      userAccount: account.user._id,
      parent: req.body.parent,
      createdBy: req.user._id
    });
    console.log(`[EduTrack] Student profile created: ${req.body.email}`);
  } catch (error) {
    if (!account.reused) {
      await User.findByIdAndDelete(account.user._id);
      console.log(`[EduTrack] Rolled back student user after profile creation failed: ${req.body.email}`);
    }
    throw error;
  }

  if (req.body.parent) {
    await Parent.findByIdAndUpdate(req.body.parent, {
      $addToSet: {
        children: student._id,
        linkedStudents: student._id
      }
    });
    console.log(`[EduTrack] Student linked to existing parent: ${req.body.email}`);
  } else if (req.body.parentEmail) {
    await linkStudentToParent({
      student,
      parentName: req.body.parentName,
      parentEmail: req.body.parentEmail,
      parentPhone: req.body.parentPhone,
      relationship: req.body.parentRelationship,
      createdBy: req.user._id
    });
  }

  const populatedStudent = await student.populate([
    { path: 'course', select: 'courseName courseCode instructor' },
    { path: 'userAccount', select: 'name email role profilePhoto' },
    { path: 'parent', select: 'name email phone' },
    { path: 'createdBy', select: 'name email role' }
  ]);

  await emitStudentActivity(req.app, 'student:create', populatedStudent);

  sendSuccess(res, 201, 'Student created successfully', {
    student: populatedStudent,
    temporaryPassword: account.temporaryPassword
  });
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await assertAllowedStudentAccess(req, res, student);

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
    courseId: req.body.courseId || req.body.course,
    departmentId: req.body.departmentId,
    sectionId: req.body.sectionId,
    age: req.body.age,
    phone: req.body.phone,
    alternatePhone: req.body.alternatePhone,
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
    parent: req.body.parent
  };

  Object.keys(allowedUpdates).forEach((key) => {
    if (allowedUpdates[key] === undefined) delete allowedUpdates[key];
  });

  const updatedStudent = await Student.findByIdAndUpdate(req.params.id, allowedUpdates, {
    new: true,
    runValidators: true
  })
    .populate('course', 'courseName courseCode instructor')
    .populate('courseId', 'courseName courseCode instructor')
    .populate('departmentId', 'departmentName departmentCode')
    .populate('sectionId', 'sectionName year')
    .populate('userAccount', 'name email role profilePhoto')
    .populate('parent', 'name email phone')
    .populate('createdBy', 'name email role');

  await emitStudentActivity(req.app, 'student:update', updatedStudent);

  if (allowedUpdates.parent) {
    await Parent.findByIdAndUpdate(allowedUpdates.parent, {
      $addToSet: {
        children: updatedStudent._id,
        linkedStudents: updatedStudent._id
      }
    });
  } else if (req.body.parentEmail) {
    await linkStudentToParent({
      student: updatedStudent,
      parentName: req.body.parentName,
      parentEmail: req.body.parentEmail,
      parentPhone: req.body.parentPhone,
      relationship: req.body.parentRelationship,
      createdBy: req.user._id
    });
  }

  sendSuccess(res, 200, 'Student updated successfully', updatedStudent);
});

const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await student.deleteOne();
  req.app.get('io')?.to('announcements').emit('dashboardUpdate', {
    type: 'student:delete',
    studentId: req.params.id
  });
  sendSuccess(res, 200, 'Student deleted successfully');
});

const updateAttendance = asyncHandler(async (req, res) => {
  if (!isTeacher(req.user)) {
    res.status(403);
    throw new Error('Only teachers can update attendance');
  }

  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await assertAllowedStudentAccess(req, res, student);

  const { attendance, subjectId } = req.body;

  if (subjectId) {
    if (!student.subjectGrades) student.subjectGrades = [];
    let record = student.subjectGrades.find((g) => g.subjectId?.toString() === subjectId.toString());
    if (record) {
      record.attendance = Number(attendance);
    } else {
      student.subjectGrades.push({ subjectId, attendance: Number(attendance) });
    }

    const totalAttendance = student.subjectGrades.reduce((sum, item) => sum + (item.attendance || 0), 0);
    student.attendance = Math.round(totalAttendance / student.subjectGrades.length);
  } else {
    student.attendance = Number(attendance);
  }

  await student.save();
  await emitStudentActivity(req.app, 'student:attendance', student);
  sendSuccess(res, 200, 'Attendance updated successfully', student);
});

const updateGrades = asyncHandler(async (req, res) => {
  if (!isTeacher(req.user)) {
    res.status(403);
    throw new Error('Only teachers can update grades and academic remarks');
  }

  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await assertAllowedStudentAccess(req, res, student);

  const { marks, courseProgress, remarks, resultPublished, subjectId } = req.body;

  if (subjectId) {
    if (!student.subjectGrades) student.subjectGrades = [];
    let record = student.subjectGrades.find((g) => g.subjectId?.toString() === subjectId.toString());
    if (record) {
      if (marks !== undefined) record.marks = Number(marks);
      if (remarks !== undefined) record.remarks = remarks;
      if (resultPublished !== undefined) record.resultPublished = resultPublished;
    } else {
      student.subjectGrades.push({
        subjectId,
        marks: marks !== undefined ? Number(marks) : 0,
        remarks: remarks || '',
        resultPublished: resultPublished || false
      });
    }

    const totalMarks = student.subjectGrades.reduce((sum, item) => sum + (item.marks || 0), 0);
    student.marks = Math.round(totalMarks / student.subjectGrades.length);

    if (courseProgress !== undefined) student.courseProgress = Number(courseProgress);
    if (remarks !== undefined) student.remarks = remarks;
    if (resultPublished !== undefined) student.resultPublished = resultPublished;
  } else {
    if (marks !== undefined) student.marks = Number(marks);
    if (courseProgress !== undefined) student.courseProgress = Number(courseProgress);
    if (remarks !== undefined) student.remarks = remarks;
    if (resultPublished !== undefined) student.resultPublished = resultPublished;
  }

  await student.save();
  await emitStudentActivity(req.app, 'student:grades', student);
  sendSuccess(res, 200, 'Grades updated successfully', student);
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
