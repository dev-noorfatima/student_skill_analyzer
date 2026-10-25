const mongoose = require('mongoose');

/**
 * LearningPath Schema
 * Step-by-step learning roadmaps and career milestones
 */
const learningPathSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Learning path title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true
    },
    targetRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobRole'
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      index: true
    },
    isTemplate: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      trim: true
    },
    estimatedWeeks: {
      type: Number,
      default: 8
    },
    milestones: [
      {
        stepNumber: {
          type: Number,
          required: true
        },
        title: {
          type: String,
          required: true,
          trim: true
        },
        description: String,
        skillsCovered: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Skill'
          }
        ],
        resources: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LearningResource'
          }
        ],
        assessmentToUnlock: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Assessment'
        },
        isCompleted: {
          type: Boolean,
          default: false
        },
        completedAt: Date
      }
    ],
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'paused'],
      default: 'not_started'
    },
    startDate: Date,
    completionDate: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('LearningPath', learningPathSchema);
