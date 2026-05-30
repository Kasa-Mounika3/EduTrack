const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    subject: {
      type: String,
      trim: true,
      default: ''
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student', 'parent', 'all'],
      default: 'all'
    },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'teachers', 'parents', 'department', 'year', 'section'],
      default: 'all'
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    year: {
      type: String,
      trim: true,
      default: ''
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    },
    emailDelivery: {
      status: {
        type: String,
        enum: ['pending', 'sent', 'skipped', 'failed'],
        default: 'pending'
      },
      sent: {
        type: Number,
        default: 0
      },
      reason: {
        type: String,
        default: ''
      }
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ receiver: 1, createdAt: -1 });
notificationSchema.index({ role: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
