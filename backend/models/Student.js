const mongoose = require('mongoose');

/**
 * Student Schema
 * Detailed academic and career profile linked to a base User account
 */
const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student must be linked to a User account'],
      unique: true
    },
    rollNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    registrationNumber: {
      type: String,
      trim: true
    },
    institution: {
      type: String,
      trim: true,
      default: 'University'
    },
    department: {
      type: String,
      trim: true,
      default: 'Computer Science & IT'
    },
    major: {
      type: String,
      trim: true,
      default: 'Software Engineering'
    },
    currentSemester: {
      type: Number,
      min: [1, 'Semester cannot be less than 1'],
      max: [12, 'Semester cannot exceed 12'],
      default: 1
    },
    academicYear: {
      type: String,
      trim: true
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10'],
      default: 0.0
    },
    targetCareerRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobRole'
    },
    targetCareerTitle: {
      type: String,
      trim: true,
      default: 'Full Stack Developer'
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      trim: true
    },
    socialProfiles: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      leetcode: { type: String, trim: true },
      portfolio: { type: String, trim: true }
    },
    resumeUrl: {
      type: String,
      trim: true
    },
    preferredLearningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'reading_writing', 'kinesthetic', 'project_based'],
      default: 'project_based'
    },
    interests: [
      {
        type: String,
        trim: true
      }
    ],
    overallProficiencyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    totalAssessmentsCompleted: {
      type: Number,
      default: 0
    },
    totalBadgesEarned: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'graduated', 'on_leave', 'suspended'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for student skills
studentSchema.virtual('skills', {
  ref: 'StudentSkill',
  localField: '_id',
  foreignField: 'student'
});

// Virtual field for student assessments submissions
studentSchema.virtual('assessmentSubmissions', {
  ref: 'AssessmentSubmission',
  localField: '_id',
  foreignField: 'student'
});

// Virtual field for student projects
studentSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'student'
});

// Virtual field for student certificates/badges
studentSchema.virtual('certificates', {
  ref: 'Certificate',
  localField: '_id',
  foreignField: 'student'
});

module.exports = mongoose.model('Student', studentSchema);
