const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    teacherName: {
      type: String,
      required: [true, 'Teacher name is required'],
      trim: true
    },
    name: { type: String, trim: true, default: '' },
    profilePhoto: { type: String, default: '' },
    teacherId: { type: String, trim: true, default: '' },
    email: {
      type: String,
      required: [true, 'Teacher email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    phone: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
    assignedSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    assignedSections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
    qualification: { type: String, trim: true, default: '' },
    experience: { type: String, trim: true, default: '' },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

teacherSchema.index({ teacherName: 'text', name: 'text', email: 'text', subject: 'text' });

module.exports = mongoose.model('Teacher', teacherSchema);
