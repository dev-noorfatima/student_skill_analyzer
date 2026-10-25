const { Analysis, Student } = require('../models');
const { runSkillGapAnalysis } = require('../services/analysisService');

/**
 * @desc    Generate a new skill gap analysis for student
 * @route   POST /api/analysis/generate
 * @access  Private (Student, Instructor, Admin)
 */
const generateAnalysis = async (req, res, next) => {
  try {
    let studentId;

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }
      studentId = student._id;
    } else {
      studentId = req.body.studentId;
      if (!studentId) {
        return res.status(400).json({ success: false, message: 'Please provide a studentId' });
      }
    }

    const targetRoleId = req.body.targetRoleId || null;

    const analysisReport = await runSkillGapAnalysis(studentId, targetRoleId);

    res.status(201).json({
      success: true,
      message: 'Skill gap analysis generated successfully',
      data: analysisReport
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get latest analysis report for student
 * @route   GET /api/analysis/latest
 * @access  Private (Student)
 */
const getLatestAnalysis = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const latest = await Analysis.findOne({ student: student._id })
      .sort({ createdAt: -1 })
      .populate('targetRole', 'title category marketInsights')
      .populate('strengths.skill', 'name category icon')
      .populate('skillGaps.skill', 'name category icon')
      .populate('recommendations.resourceId', 'title url provider resourceType durationHours')
      .populate('recommendations.skillId', 'name category');

    if (!latest) {
      return res.status(200).json({
        success: true,
        message: 'No analysis performed yet. Click generate to analyze your skills.',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: latest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get analysis history to track improvement over time
 * @route   GET /api/analysis/history
 * @access  Private (Student)
 */
const getAnalysisHistory = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const history = await Analysis.find({ student: student._id })
      .select('overallReadinessScore readinessStatus targetRole analyzedAt createdAt')
      .populate('targetRole', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get analysis report by ID
 * @route   GET /api/analysis/:id
 * @access  Private
 */
const getAnalysisById = async (req, res, next) => {
  try {
    const report = await Analysis.findById(req.params.id)
      .populate('targetRole')
      .populate('strengths.skill', 'name category icon')
      .populate('skillGaps.skill', 'name category icon')
      .populate('recommendations.resourceId');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Analysis report not found' });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateAnalysis,
  getLatestAnalysis,
  getAnalysisHistory,
  getAnalysisById
};
