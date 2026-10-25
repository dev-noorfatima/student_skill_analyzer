const mongoose = require('mongoose');

/**
 * Project Schema
 * Student practical portfolio projects verifying application of skills
 */
const projectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    skillsDemonstrated: [
      {
        skill: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Skill',
          required: true
        },
        importance: {
          type: String,
          enum: ['core', 'secondary'],
          default: 'core'
        }
      }
    ],
    technologies: [
      {
        type: String,
        trim: true
      }
    ],
    githubUrl: {
      type: String,
      trim: true
    },
    liveDemoUrl: {
      type: String,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    screenshots: [
      {
        type: String,
        trim: true
      }
    ],
    verifiedByMentor: {
      type: Boolean,
      default: false
    },
    mentorReview: {
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      comments: String,
      reviewedAt: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Project', projectSchema);
