const mongoose = require('mongoose');

/**
 * Analysis Schema
 * Generates and stores comprehensive skill evaluations, gap analysis, and career readiness scores
 */
const analysisSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true
    },
    targetRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobRole'
    },
    overallReadinessScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
      default: 0
    },
    readinessStatus: {
      type: String,
      enum: ['needs_foundation', 'in_progress', 'near_ready', 'job_ready'],
      default: 'needs_foundation'
    },
    strengths: [
      {
        skill: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Skill',
          required: true
        },
        proficiencyLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert']
        },
        score: {
          type: Number,
          min: 0,
          max: 100
        },
        reason: String
      }
    ],
    skillGaps: [
      {
        skill: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Skill',
          required: true
        },
        targetLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'intermediate'
        },
        currentLevel: {
          type: String,
          enum: ['none', 'beginner', 'intermediate', 'advanced', 'expert'],
          default: 'none'
        },
        gapPercentage: {
          type: Number,
          min: 0,
          max: 100,
          default: 0
        },
        severity: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical'],
          default: 'medium'
        },
        estimatedHoursToBridge: {
          type: Number,
          default: 20
        }
      }
    ],
    categoryBreakdown: [
      {
        category: {
          type: String,
          required: true
        },
        currentScore: {
          type: Number,
          min: 0,
          max: 100,
          default: 0
        },
        benchmarkScore: {
          type: Number,
          min: 0,
          max: 100,
          default: 70
        }
      }
    ],
    recommendations: [
      {
        type: {
          type: String,
          enum: ['take_assessment', 'study_resource', 'build_project', 'mentor_session', 'earn_certificate'],
          default: 'study_resource'
        },
        title: {
          type: String,
          required: true
        },
        description: String,
        priority: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium'
        },
        resourceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'LearningResource'
        },
        skillId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Skill'
        }
      }
    ],
    aiInsights: {
      summary: String,
      careerAdvice: String,
      estimatedTimeToJobReadinessWeeks: {
        type: Number,
        default: 12
      },
      suggestedWeeklyStudyHours: {
        type: Number,
        default: 10
      }
    },
    analyzedAt: {
      type: Date,
      default: Date.now
    },
    engineVersion: {
      type: String,
      default: 'v1.0'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Analysis', analysisSchema);
