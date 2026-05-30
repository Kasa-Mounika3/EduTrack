const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    subjectName: { type: String, required: true, trim: true },
    subjectCode: { type: String, required: true, trim: true, uppercase: true, unique: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    year: { type: String, required: true, trim: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', index: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
