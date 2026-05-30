const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    name: { type: String, trim: true, default: '' },
    profilePhoto: { type: String, default: '' },
    studentId: { type: String, trim: true, default: '' },
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    gender: { type: String, trim: true, default: '' },
    dateOfBirth: { type: Date },
    email: {
      type: String,
      required: [true, 'Student email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      index: true
    },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', index: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      index: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      index: true
    },
    age: {
      type: Number,
      min: [1, 'Age must be greater than 0']
    },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
    year: { type: String, trim: true, default: '' },
    semester: { type: String, trim: true, default: '' },
    admissionDate: { type: Date },
    parentName: { type: String, trim: true, default: '' },
    parentRelationship: { type: String, trim: true, default: '' },
    parentPhone: { type: String, trim: true, default: '' },
    parentEmail: { type: String, trim: true, lowercase: true, default: '' },
    attendance: {
      type: Number,
      default: 0,
      min: [0, 'Attendance cannot be less than 0'],
      max: [100, 'Attendance cannot be more than 100']
    },
    marks: {
      type: Number,
      default: 0,
      min: [0, 'Marks cannot be less than 0'],
      max: [100, 'Marks cannot be more than 100']
    },
    courseProgress: {
      type: Number,
      default: 0,
      min: [0, 'Course progress cannot be less than 0'],
      max: [100, 'Course progress cannot be more than 100']
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    resultPublished: {
      type: Boolean,
      default: false
    },
    recentActivity: [
      {
        title: {
          type: String,
          required: true,
          trim: true
        },
        description: {
          type: String,
          trim: true,
          default: ''
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

studentSchema.index({ createdAt: -1 });
studentSchema.index({ studentName: 'text', name: 'text', email: 'text' });
studentSchema.index({ user: 1, email: 1 });

studentSchema.virtual('grade').get(function getGrade() {
  if (this.marks >= 90) return 'A';
  if (this.marks >= 75) return 'B';
  if (this.marks >= 60) return 'C';
  if (this.marks >= 40) return 'D';
  return 'Needs Improvement';
});

studentSchema.pre('save', function normalizeStudentEmail(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }

  next();
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
