const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    sectionName: { type: String, required: true, trim: true, uppercase: true },
    year: { type: String, required: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

sectionSchema.index({ sectionName: 1, year: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
