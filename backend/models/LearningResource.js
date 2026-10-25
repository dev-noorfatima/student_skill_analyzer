const mongoose = require('mongoose');

/**
 * LearningResource Schema
 * Curated tutorials, courses, documentation, and videos mapped to skills
 */
const learningResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
      trim: true
    },
    provider: {
      type: String,
      enum: [
        'Coursera',
        'Udemy',
        'YouTube',
        'freeCodeCamp',
        'edX',
        'Documentation',
        'Medium',
        'LeetCode',
        'GitHub',
        'Custom',
        'Other'
      ],
      default: 'Coursera'
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Resource must be associated with a skill'],
      index: true
    },
    targetLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    resourceType: {
      type: String,
      enum: ['course', 'video', 'article', 'interactive_tutorial', 'book', 'cheat_sheet'],
      default: 'course'
    },
    durationHours: {
      type: Number,
      min: 0,
      default: 5
    },
    isFree: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5
    },
    author: {
      type: String,
      trim: true
    },
    thumbnailUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400'
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('LearningResource', learningResourceSchema);
