const { JobRole } = require('../models');

/**
 * @desc    Get all job roles (career benchmarks)
 * @route   GET /api/job-roles
 * @access  Public
 */
const getAllJobRoles = async (req, res, next) => {
  try {
    const { category, experienceLevel, search } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (search) query.title = new RegExp(search, 'i');

    const jobRoles = await JobRole.find(query)
      .populate('requiredSkills.skill', 'name category icon')
      .populate('niceToHaveSkills.skill', 'name category icon')
      .sort({ title: 1 });

    res.status(200).json({
      success: true,
      count: jobRoles.length,
      data: jobRoles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single job role by ID or Slug
 * @route   GET /api/job-roles/:id
 * @access  Public
 */
const getJobRoleById = async (req, res, next) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };

    const jobRole = await JobRole.findOne(query)
      .populate('requiredSkills.skill', 'name category icon industryDemandScore')
      .populate('niceToHaveSkills.skill', 'name category icon');

    if (!jobRole) {
      return res.status(404).json({ success: false, message: 'Job role not found' });
    }

    res.status(200).json({
      success: true,
      data: jobRole
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new job role benchmark
 * @route   POST /api/job-roles
 * @access  Private (Admin)
 */
const createJobRole = async (req, res, next) => {
  try {
    const jobRole = await JobRole.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Job role created successfully',
      data: jobRole
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update job role
 * @route   PUT /api/job-roles/:id
 * @access  Private (Admin)
 */
const updateJobRole = async (req, res, next) => {
  try {
    const jobRole = await JobRole.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!jobRole) {
      return res.status(404).json({ success: false, message: 'Job role not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Job role updated successfully',
      data: jobRole
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete job role
 * @route   DELETE /api/job-roles/:id
 * @access  Private (Admin)
 */
const deleteJobRole = async (req, res, next) => {
  try {
    const jobRole = await JobRole.findById(req.params.id);
    if (!jobRole) {
      return res.status(404).json({ success: false, message: 'Job role not found' });
    }

    await jobRole.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job role deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllJobRoles,
  getJobRoleById,
  createJobRole,
  updateJobRole,
  deleteJobRole
};
