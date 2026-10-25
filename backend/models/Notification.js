const mongoose = require('mongoose');

/**
 * Notification Schema
 * Real-time alerts, assessment updates, analysis reports, and mentor notes for users
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    type: {
      type: String,
      enum: [
        'assessment_result',
        'analysis_ready',
        'recommendation',
        'badge_earned',
        'mentor_feedback',
        'system_alert'
      ],
      default: 'system_alert'
    },
    link: {
      type: String,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
