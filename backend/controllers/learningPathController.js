const { LearningPath, Student } = require('../models');

/**
 * @desc    Get learning paths (templates or student roadmaps)
 * @route   GET /api/learning-paths
 * @access  Public / Private
 */
const getLearningPaths = async (req, res, next) => {
  try {
    const { isTemplate, targetRole } = req.query;

    const query = {};
    if (isTemplate !== undefined) query.isTemplate = isTemplate === 'true';
    if (targetRole) query.targetRole = targetRole;

    // If student is logged in, optionally include student-specific paths
    if (req.user && req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) {
        query.$or = [{ isTemplate: true }, { student: student._id }];
      }
    }

    const paths = await LearningPath.find(query)
      .populate('targetRole', 'title category')
      .populate('milestones.skillsCovered', 'name category icon')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: paths.length,
      data: paths
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single learning path with populated milestones
 * @route   GET /api/learning-paths/:id
 * @access  Public
 */
const getLearningPathById = async (req, res, next) => {
  try {
    const path = await LearningPath.findById(req.params.id)
      .populate('targetRole')
      .populate('milestones.skillsCovered')
      .populate('milestones.resources')
      .populate('milestones.assessmentToUnlock');

    if (!path) {
      return res.status(404).json({ success: false, message: 'Learning path not found' });
    }

    res.status(200).json({
      success: true,
      data: path
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new learning path template
 * @route   POST /api/learning-paths
 * @access  Private (Admin, Instructor)
 */
const createLearningPath = async (req, res, next) => {
  try {
    const path = await LearningPath.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Learning path created successfully',
      data: path
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Enroll student in a learning path template
 * @route   POST /api/learning-paths/:id/enroll
 * @access  Private (Student)
 */
const enrollInLearningPath = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const templatePath = await LearningPath.findById(req.params.id);
    if (!templatePath) {
      return res.status(404).json({ success: false, message: 'Learning path template not found' });
    }

    // Clone template for student
    const studentPath = await LearningPath.create({
      title: templatePath.title,
      description: templatePath.description,
      targetRole: templatePath.targetRole,
      student: student._id,
      isTemplate: false,
      category: templatePath.category,
      estimatedWeeks: templatePath.estimatedWeeks,
      milestones: templatePath.milestones.map((m) => ({
        stepNumber: m.stepNumber,
        title: m.title,
        description: m.description,
        skillsCovered: m.skillsCovered,
        resources: m.resources,
        assessmentToUnlock: m.assessmentToUnlock,
        isCompleted: false
      })),
      status: 'in_progress',
      startDate: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Enrolled in learning path successfully',
      data: studentPath
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update milestone completion status
 * @route   PUT /api/learning-paths/:id/milestone/:stepNumber
 * @access  Private (Student)
 */
const updateMilestone = async (req, res, next) => {
  try {
    const { isCompleted } = req.body;
    const path = await LearningPath.findById(req.params.id);

    if (!path) {
      return res.status(404).json({ success: false, message: 'Learning path not found' });
    }

    const stepNum = Number(req.params.stepNumber);
    const milestone = path.milestones.find((m) => m.stepNumber === stepNum);

    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone step not found' });
    }

    milestone.isCompleted = isCompleted;
    if (isCompleted) {
      milestone.completedAt = new Date();
    }

    // Recalculate progress percentage
    const completedCount = path.milestones.filter((m) => m.isCompleted).length;
    path.progressPercentage = Math.round((completedCount / path.milestones.length) * 100);

    if (path.progressPercentage === 100) {
      path.status = 'completed';
      path.completionDate = new Date();
    } else {
      path.status = 'in_progress';
    }

    await path.save();

    res.status(200).json({
      success: true,
      message: 'Milestone updated successfully',
      data: path
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLearningPaths,
  getLearningPathById,
  createLearningPath,
  enrollInLearningPath,
  updateMilestone
};
