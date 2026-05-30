const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true
    },
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true
    },
    departments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

courseSchema.index({ courseName: 'text', courseCode: 'text', instructor: 'text' });

courseSchema.virtual('displayName').get(function getDisplayName() {
  return `${this.courseCode} - ${this.courseName}`;
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
