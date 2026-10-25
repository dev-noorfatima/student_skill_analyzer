const mongoose = require('mongoose');

/**
 * Assessment Schema
 * Represents skill evaluation tests, quizzes, and technical challenges
 */
const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    targetSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'An assessment must target a specific skill']
    },
    additionalSkillsCovered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
      }
    ],
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert', 'mixed'],
      default: 'intermediate'
    },
    assessmentType: {
      type: String,
      enum: ['multiple_choice', 'coding_challenge', 'conceptual_quiz', 'comprehensive_exam'],
      default: 'multiple_choice'
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [5, 'Duration cannot be less than 5 minutes'],
      default: 30
    },
    passingPercentage: {
      type: Number,
      min: [0, 'Passing percentage cannot be negative'],
      max: [100, 'Passing percentage cannot exceed 100'],
      default: 60
    },
    totalMarks: {
      type: Number,
      default: 100
    },
    questions: [
      {
        questionText: {
          type: String,
          required: [true, 'Question text is required'],
          trim: true
        },
        codeSnippet: {
          type: String,
          trim: true
        },
        questionType: {
          type: String,
          enum: ['multiple_choice', 'true_false', 'code_output', 'short_answer'],
          default: 'multiple_choice'
        },
        options: [
          {
            optionId: {
              type: String,
              required: true
            },
            text: {
              type: String,
              required: true,
              trim: true
            },
            isCorrect: {
              type: Boolean,
              required: true,
              default: false
            }
          }
        ],
        correctAnswerExplanation: {
          type: String,
          trim: true
        },
        points: {
          type: Number,
          default: 5,
          min: 1
        },
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium'
        }
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for submissions
assessmentSchema.virtual('submissions', {
  ref: 'AssessmentSubmission',
  localField: '_id',
  foreignField: 'assessment'
});

module.exports = mongoose.model('Assessment', assessmentSchema);
