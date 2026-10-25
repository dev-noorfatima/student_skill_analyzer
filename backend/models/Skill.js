const mongoose = require('mongoose');

/**
 * Skill Schema
 * Standard catalog of technical, domain, and soft skills with taxonomy
 */
const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Skill name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      enum: {
        values: [
          'Frontend',
          'Backend',
          'Full Stack',
          'Database',
          'DevOps & Cloud',
          'Data Science & AI',
          'Mobile Development',
          'Cybersecurity',
          'Core CS & Algorithms',
          'Soft Skills & Communication',
          'Testing & QA',
          'UI/UX Design',
          'Other'
        ],
        message: '{VALUE} is not a valid skill category'
      },
      index: true
    },
    subcategory: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    icon: {
      type: String,
      default: 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png'
    },
    proficiencyCriteria: [
      {
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          required: true
        },
        description: { type: String, trim: true },
        benchmarks: [{ type: String, trim: true }]
      }
    ],
    industryDemandScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 75
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
      }
    ],
    relatedSkills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
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

// Pre-save hook to generate slug
skillSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});

// Virtual for learning resources linked to this skill
skillSchema.virtual('learningResources', {
  ref: 'LearningResource',
  localField: '_id',
  foreignField: 'skill'
});

// Virtual for assessments linked to this skill
skillSchema.virtual('assessments', {
  ref: 'Assessment',
  localField: '_id',
  foreignField: 'targetSkill'
});

module.exports = mongoose.model('Skill', skillSchema);
