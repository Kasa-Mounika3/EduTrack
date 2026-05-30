const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const Student = require('./src/models/Student');
const Teacher = require('./src/models/Teacher');
const Parent = require('./src/models/Parent');
const Course = require('./src/models/Course');
const Department = require('./src/models/Department');
const Section = require('./src/models/Section');
const Subject = require('./src/models/Subject');
const AcademicYear = require('./src/models/AcademicYear');

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI, { dbName: 'edutrack' });
    console.log('Connected! Cleaning up existing database...');

    // Delete existing entries to prevent duplicates and start fresh
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Teacher.deleteMany({}),
      Parent.deleteMany({}),
      Course.deleteMany({}),
      Department.deleteMany({}),
      Section.deleteMany({}),
      Subject.deleteMany({}),
      AcademicYear.deleteMany({})
    ]);

    console.log('Creating Admin Account...');
    const adminUser = await User.create({
      name: 'Admin Principal',
      email: 'admin@edutrack.com',
      password: 'admin@123',
      role: 'admin'
    });

    console.log('Creating Teacher Account (Mr. Ravi)...');
    const teacherUser = await User.create({
      name: 'Mr. Ravi',
      email: 'ravi@edutrack.com',
      password: 'ravi@123',
      role: 'teacher'
    });

    console.log('Creating Parent Account...');
    const parentUser = await User.create({
      name: 'Parent Guardian',
      email: 'parent@edutrack.com',
      password: 'parent@123',
      role: 'parent'
    });

    console.log('Creating B.Tech Course...');
    const course = await Course.create({
      courseName: 'Bachelor of Technology',
      courseCode: 'B.TECH',
      instructor: 'Dr. Srinivas',
      description: 'Four year undergraduate degree in engineering.',
      createdBy: adminUser._id
    });

    console.log('Creating Computer Science Department...');
    const department = await Department.create({
      departmentName: 'Computer Science',
      departmentCode: 'CS',
      course: course._id,
      createdBy: adminUser._id
    });
    
    await Course.findByIdAndUpdate(course._id, { $push: { departments: department._id } });

    console.log('Creating 3rd Year Section A...');
    const section = await Section.create({
      sectionName: 'A',
      year: '3rd Year',
      course: course._id,
      department: department._id,
      createdBy: adminUser._id
    });

    console.log('Creating Academic Year...');
    const academicYear = await AcademicYear.create({
      yearName: '2026-2027',
      startsOn: new Date('2026-06-01'),
      endsOn: new Date('2027-05-31'),
      isActive: true,
      createdBy: adminUser._id
    });

    console.log('Creating Teacher Profile...');
    const teacher = await Teacher.create({
      name: 'Mr. Ravi',
      teacherName: 'Mr. Ravi',
      email: 'ravi@edutrack.com',
      phone: '+91 98765 43210',
      department: 'Computer Science',
      departmentId: department._id,
      qualification: 'M.Tech in CSE',
      experience: '8 Years',
      userAccount: teacherUser._id,
      createdBy: adminUser._id
    });

    console.log('Creating Data Structures & DBMS Subjects...');
    const subject1 = await Subject.create({
      subjectName: 'Data Structures',
      subjectCode: 'CS-301',
      course: course._id,
      department: department._id,
      year: '3rd Year',
      section: section._id,
      teacher: teacher._id,
      createdBy: adminUser._id
    });

    const subject2 = await Subject.create({
      subjectName: 'Database Management Systems',
      subjectCode: 'CS-302',
      course: course._id,
      department: department._id,
      year: '3rd Year',
      section: section._id,
      teacher: teacher._id,
      createdBy: adminUser._id
    });

    // Update teacher profile assignments
    await Teacher.findByIdAndUpdate(teacher._id, {
      $set: {
        assignedSubjects: [subject1._id, subject2._id],
        assignedSections: [section._id]
      }
    });

    console.log('Creating Parent Profile...');
    const parent = await Parent.create({
      name: 'Parent Guardian',
      parentName: 'Parent Guardian',
      email: 'parent@edutrack.com',
      phone: '+91 91234 56789',
      relationship: 'Father',
      userAccount: parentUser._id,
      createdBy: adminUser._id
    });

    console.log('Creating Student Profile (Charan)...');
    const studentUser1 = await User.create({
      name: 'Charan',
      email: 'charan@edutrack.com',
      password: 'charan@123',
      role: 'student'
    });

    const student1 = await Student.create({
      studentName: 'Charan',
      name: 'Charan',
      studentId: 'EDU-1001',
      gender: 'Male',
      dateOfBirth: new Date('2005-08-15'),
      email: 'charan@edutrack.com',
      phone: '+91 99999 88888',
      course: course._id,
      courseId: course._id,
      departmentId: department._id,
      sectionId: section._id,
      department: 'Computer Science',
      year: '3rd Year',
      semester: 'Semester 5',
      parentName: 'Parent Guardian',
      parentEmail: 'parent@edutrack.com',
      parentPhone: '+91 91234 56789',
      parentRelationship: 'Father',
      parent: parent._id,
      userAccount: studentUser1._id,
      createdBy: adminUser._id,
      subjectGrades: [
        {
          subjectId: subject1._id,
          marks: 85,
          attendance: 92,
          remarks: 'Excellent problem solving skills.',
          resultPublished: true
        },
        {
          subjectId: subject2._id,
          marks: 78,
          attendance: 88,
          remarks: 'Good understanding of SQL queries.',
          resultPublished: true
        }
      ],
      marks: 82, // Overall Average
      attendance: 90 // Overall Average
    });

    console.log('Creating Student Profile (Mounika)...');
    const studentUser2 = await User.create({
      name: 'Mounika',
      email: 'mounika@edutrack.com',
      password: 'mounika@123',
      role: 'student'
    });

    const student2 = await Student.create({
      studentName: 'Mounika',
      name: 'Mounika',
      studentId: 'EDU-1002',
      gender: 'Female',
      dateOfBirth: new Date('2006-03-22'),
      email: 'mounika@edutrack.com',
      phone: '+91 99999 77777',
      course: course._id,
      courseId: course._id,
      departmentId: department._id,
      sectionId: section._id,
      department: 'Computer Science',
      year: '3rd Year',
      semester: 'Semester 5',
      parentName: 'Parent Guardian',
      parentEmail: 'parent@edutrack.com',
      parentPhone: '+91 91234 56789',
      parentRelationship: 'Father',
      parent: parent._id,
      userAccount: studentUser2._id,
      createdBy: adminUser._id,
      subjectGrades: [
        {
          subjectId: subject1._id,
          marks: 92,
          attendance: 96,
          remarks: 'Outstanding performance in algorithms.',
          resultPublished: true
        },
        {
          subjectId: subject2._id,
          marks: 88,
          attendance: 94,
          remarks: 'Very diligent and active in class.',
          resultPublished: true
        }
      ],
      marks: 90,
      attendance: 95
    });

    // Link students to parent
    await Parent.findByIdAndUpdate(parent._id, {
      $set: {
        children: [student1._id, student2._id],
        linkedStudents: [student1._id, student2._id]
      }
    });

    console.log('Database seeded successfully!');
    console.log('Logins created:');
    console.log('- Admin: admin@edutrack.com / admin@123');
    console.log('- Teacher: ravi@edutrack.com / ravi@123');
    console.log('- Student (Charan): charan@edutrack.com / charan@123');
    console.log('- Student (Mounika): mounika@edutrack.com / mounika@123');
    console.log('- Parent: parent@edutrack.com / parent@123');

    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    mongoose.connection.close();
  }
};

seed();
