const mongoose = require('mongoose');

/**
 * MentorFeedback Schema
 * Stores qualitative reviews, mock interview evaluations, and guidance from mentors/instructors
 */
const mentorFeedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor reference is required'],
      index: true
    },
    sessionType: {
      type: String,
      enum: ['mock_interview', 'code_review', 'skill_assessment', 'career_mentoring', 'general_feedback'],
      default: 'skill_assessment'
    },
    overallRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      required: [true, 'Overall rating is required']
    },
    skillRatings: [
      {
        skill: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Skill',
          required: true
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true
        },
        notes: String
      }
    ],
    summary: {
      type: String,
      required: [true, 'Feedback summary is required'],
      trim: true
    },
    strengths: [
      {
        type: String,
        trim: true
      }
    ],
    weaknesses: [
      {
        type: String,
        trim: true
      }
    ],
    recommendedActionItems: [
      {
        action: {
          type: String,
          required: true,
          trim: true
        },
        dueDate: Date,
        isCompleted: {
          type: Boolean,
          default: false
        }
      }
    ],
    sessionDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('MentorFeedback', mentorFeedbackSchema);
