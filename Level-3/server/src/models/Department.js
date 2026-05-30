const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    departmentName: { type: String, required: true, trim: true },
    departmentCode: { type: String, trim: true, uppercase: true, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

departmentSchema.index({ departmentName: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);
