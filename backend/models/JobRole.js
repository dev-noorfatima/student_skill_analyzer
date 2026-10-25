const mongoose = require('mongoose');

/**
 * JobRole Schema
 * Industry benchmark job profiles specifying required skills, weights, and expectations
 */
const jobRoleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job role title is required'],
      unique: true,
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    experienceLevel: {
      type: String,
      enum: ['entry_level', 'junior', 'mid_level', 'senior'],
      default: 'entry_level'
    },
    requiredSkills: [
      {
        skill: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Skill',
          required: true
        },
        minProficiencyLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'intermediate'
        },
        minScore: {
          type: Number,
          min: 0,
          max: 100,
          default: 65
        },
        weight: {
          type: Number,
          min: 1,
          max: 10,
          default: 5
        },
        isMandatory: {
          type: Boolean,
          default: true
        }
      }
    ],
    niceToHaveSkills: [
      {
        skill: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Skill'
        },
        weight: {
          type: Number,
          default: 2
        }
      }
    ],
    marketInsights: {
      averageSalaryMin: Number,
      averageSalaryMax: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      demandLevel: {
        type: String,
        enum: ['moderate', 'high', 'very_high'],
        default: 'high'
      },
      growthRatePercentage: Number
    },
    commonResponsibilities: [
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

jobRoleSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});

module.exports = mongoose.model('JobRole', jobRoleSchema);
