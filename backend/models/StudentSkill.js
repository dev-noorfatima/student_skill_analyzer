const mongoose = require('mongoose');

/**
 * StudentSkill Schema
 * Tracks an individual student's proficiency, evaluations, and progress on a specific skill
 */
const studentSkillSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill reference is required'],
      index: true
    },
    proficiencyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    scorePercentage: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
      default: 0
    },
    selfAssessedLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    verifiedByAssessment: {
      type: Boolean,
      default: false
    },
    verifiedByMentor: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assessmentsCount: {
      type: Number,
      default: 0
    },
    projectsCompletedCount: {
      type: Number,
      default: 0
    },
    lastAssessedDate: {
      type: Date
    },
    history: [
      {
        date: {
          type: Date,
          default: Date.now
        },
        score: {
          type: Number,
          min: 0,
          max: 100
        },
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert']
        },
        source: {
          type: String,
          enum: ['self_assessment', 'quiz_assessment', 'mentor_evaluation', 'project_review', 'system_analysis'],
          default: 'quiz_assessment'
        },
        note: String
      }
    ],
    endorsements: [
      {
        mentor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        comment: String,
        endorsedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Prevent duplicate skill records for the same student
studentSkillSchema.index({ student: 1, skill: 1 }, { unique: true });

module.exports = mongoose.model('StudentSkill', studentSkillSchema);
