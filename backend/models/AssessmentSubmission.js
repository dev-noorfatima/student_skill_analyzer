const mongoose = require('mongoose');

/**
 * AssessmentSubmission Schema
 * Records a student's attempt, individual answers, score, and AI/system feedback
 */
const assessmentSubmissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: [true, 'Assessment reference is required'],
      index: true
    },
    attemptNumber: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'timed_out', 'abandoned'],
      default: 'completed'
    },
    answers: [
      {
        questionId: {
          type: String,
          required: true
        },
        selectedOptionId: {
          type: String
        },
        textAnswer: {
          type: String
        },
        isCorrect: {
          type: Boolean,
          default: false
        },
        marksAwarded: {
          type: Number,
          default: 0
        },
        timeSpentSeconds: {
          type: Number,
          default: 0
        }
      }
    ],
    totalMarksObtained: {
      type: Number,
      default: 0
    },
    totalMarksPossible: {
      type: Number,
      default: 100
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    },
    timeTakenMinutes: {
      type: Number,
      default: 0
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    evaluationFeedback: {
      summary: {
        type: String,
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
      recommendedTopicsToReview: [
        {
          type: String,
          trim: true
        }
      ]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('AssessmentSubmission', assessmentSubmissionSchema);
