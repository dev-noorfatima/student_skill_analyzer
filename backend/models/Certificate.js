const mongoose = require('mongoose');

/**
 * Certificate & Badge Schema
 * Verifiable achievements, certifications, and skill mastery badges
 */
const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Certificate title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    badgeType: {
      type: String,
      enum: ['skill_badge', 'assessment_cert', 'course_cert', 'hackathon', 'external_credential'],
      default: 'skill_badge'
    },
    badgeTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'silver'
    },
    badgeIconUrl: {
      type: String,
      default: 'https://cdn-icons-png.flaticon.com/512/610/610333.png'
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment'
    },
    issuingOrganization: {
      type: String,
      trim: true,
      default: 'Student Skill Analyzer Platform'
    },
    credentialId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    credentialUrl: {
      type: String,
      trim: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date
    },
    scoreAchieved: {
      type: Number,
      min: 0,
      max: 100
    },
    isVerified: {
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

module.exports = mongoose.model('Certificate', certificateSchema);
