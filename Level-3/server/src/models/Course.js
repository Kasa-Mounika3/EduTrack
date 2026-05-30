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
    instructor: {
      type: String,
      required: [true, 'Instructor is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    departments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
      default: []
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

courseSchema.index({ createdAt: -1 });
courseSchema.index({ courseName: 'text', courseCode: 'text', instructor: 'text' });

courseSchema.virtual('displayName').get(function getDisplayName() {
  return `${this.courseCode} - ${this.courseName}`;
});

module.exports = mongoose.model('Course', courseSchema);
