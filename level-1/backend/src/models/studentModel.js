const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    profilePhoto: {
      type: String,
      default: ''
    },
    studentId: {
      type: String,
      trim: true,
      default: ''
    },
    firstName: {
      type: String,
      trim: true,
      default: ''
    },
    lastName: {
      type: String,
      trim: true,
      default: ''
    },
    gender: {
      type: String,
      trim: true,
      default: ''
    },
    dateOfBirth: {
      type: Date
    },
    email: {
      type: String,
      required: [true, 'Student email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    course: {
      type: String,
      required: [true, 'Student course is required'],
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    country: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    year: {
      type: String,
      trim: true,
      default: ''
    },
    semester: {
      type: String,
      trim: true,
      default: ''
    },
    admissionDate: {
      type: Date
    },
    parentName: {
      type: String,
      trim: true,
      default: ''
    },
    parentRelationship: {
      type: String,
      trim: true,
      default: ''
    },
    parentPhone: {
      type: String,
      trim: true,
      default: ''
    },
    parentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    age: {
      type: Number,
      min: [1, 'Age must be greater than 0']
    }
  },
  {
    timestamps: true
  }
);

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
