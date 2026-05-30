const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema(
  {
    parentName: {
      type: String,
      required: [true, 'Parent name is required'],
      trim: true
    },
    name: { type: String, trim: true, default: '' },
    profilePhoto: { type: String, default: '' },
    email: {
      type: String,
      required: [true, 'Parent email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    relationship: { type: String, trim: true, default: '' },
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      index: true
    },
    linkedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
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

parentSchema.index({ parentName: 'text', name: 'text', email: 'text' });

module.exports = mongoose.model('Parent', parentSchema);
