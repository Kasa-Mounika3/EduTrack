const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const Student = require('./src/models/Student');
const Teacher = require('./src/models/Teacher');
const Subject = require('./src/models/Subject');

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'edutrack' });
    console.log('Connected to DB');

    const teacherUser = await User.findOne({ email: 'ravi@edutrack.com' });
    const teacher = await Teacher.findOne({ userAccount: teacherUser._id });
    const student = await Student.findOne({ email: 'charan@edutrack.com' });
    const subject = await Subject.findOne({ subjectCode: 'CS-301' });

    console.log(`Teacher ID: ${teacher._id}`);
    console.log(`Student ID: ${student._id}, Student Section: ${student.sectionId}`);
    console.log(`Subject ID: ${subject._id}, Subject Section: ${subject.section}`);

    // Verify Section Match
    const hasSectionAccess = teacher.assignedSections.some(
      (secId) => String(secId) === String(student.sectionId)
    );
    console.log(`Teacher has section access: ${hasSectionAccess}`);

    // Perform Local Update Simulation (similar to what studentController.js does)
    const subjectId = subject._id;
    const attendance = 95;
    const marks = 89;

    let record = student.subjectGrades.find((g) => g.subjectId.toString() === subjectId.toString());
    if (record) {
      record.attendance = attendance;
      record.marks = marks;
      record.remarks = 'Updated via Test Automation';
    } else {
      student.subjectGrades.push({
        subjectId,
        attendance,
        marks,
        remarks: 'Created via Test Automation'
      });
    }

    const totalAttendance = student.subjectGrades.reduce((sum, item) => sum + (item.attendance || 0), 0);
    student.attendance = Math.round(totalAttendance / student.subjectGrades.length);

    const totalMarks = student.subjectGrades.reduce((sum, item) => sum + (item.marks || 0), 0);
    student.marks = Math.round(totalMarks / student.subjectGrades.length);

    await student.save();
    console.log('Student academic record updated and saved successfully!');
    console.log(`New Average Attendance: ${student.attendance}%`);
    console.log(`New Average Marks: ${student.marks}`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Test failed:', error);
    mongoose.connection.close();
  }
};

test();
