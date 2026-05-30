const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema(
  {
    yearName: { type: String, required: true, trim: true, unique: true },
    startsOn: { type: Date },
    endsOn: { type: Date },
    isActive: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AcademicYear', academicYearSchema);
