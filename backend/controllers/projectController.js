const { Project, Student, StudentSkill } = require('../models');

/**
 * @desc    Get all projects (with filters)
 * @route   GET /api/projects
 * @access  Public
 */
const getAllProjects = async (req, res, next) => {
  try {
    const { studentId, category, verifiedOnly } = req.query;

    const query = {};
    if (studentId) query.student = studentId;
    if (category) query.category = category;
    if (verifiedOnly === 'true') query.verifiedByMentor = true;

    const projects = await Project.find(query)
      .populate('student', 'rollNumber institution')
      .populate('skillsDemonstrated.skill', 'name category icon')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student's own projects
 * @route   GET /api/projects/my
 * @access  Private (Student)
 */
const getMyProjects = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const projects = await Project.find({ student: student._id })
      .populate('skillsDemonstrated.skill', 'name category icon')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project by ID
 * @route   GET /api/projects/:id
 * @access  Public
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('student')
      .populate('skillsDemonstrated.skill')
      .populate('mentorReview.reviewer', 'name role avatar');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new project
 * @route   POST /api/projects
 * @access  Private (Student)
 */
const createProject = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const project = await Project.create({
      ...req.body,
      student: student._id
    });

    // Update projects completed count on student's skills
    if (req.body.skillsDemonstrated && Array.isArray(req.body.skillsDemonstrated)) {
      for (const item of req.body.skillsDemonstrated) {
        if (item.skill) {
          await StudentSkill.findOneAndUpdate(
            { student: student._id, skill: item.skill },
            { $inc: { projectsCompletedCount: 1 } }
          );
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private (Student)
 */
const updateProject = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, student: student._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private (Student, Admin)
 */
const deleteProject = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
      query.student = student._id;
    }

    const project = await Project.findOneAndDelete(query);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Review and evaluate student project
 * @route   POST /api/projects/:id/review
 * @access  Private (Mentor, Instructor, Admin)
 */
const reviewProject = async (req, res, next) => {
  try {
    const { score, comments } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.verifiedByMentor = true;
    project.mentorReview = {
      reviewer: req.user._id,
      score: score || 85,
      comments: comments || 'Good demonstration of practical skills.',
      reviewedAt: new Date()
    };

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project reviewed and verified successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProjects,
  getMyProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  reviewProject
};
