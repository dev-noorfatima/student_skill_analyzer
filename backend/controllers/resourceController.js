const { LearningResource } = require('../models');

/**
 * @desc    Get learning resources with filters
 * @route   GET /api/resources
 * @access  Public
 */
const getAllResources = async (req, res, next) => {
  try {
    const { skill, targetLevel, provider, isFree, search, page = 1, limit = 15 } = req.query;

    const query = { isActive: true };
    if (skill) query.skill = skill;
    if (targetLevel) query.targetLevel = targetLevel;
    if (provider) query.provider = provider;
    if (isFree !== undefined) query.isFree = isFree === 'true';
    if (search) query.title = new RegExp(search, 'i');

    const skip = (Number(page) - 1) * Number(limit);
    const total = await LearningResource.countDocuments(query);

    const resources = await LearningResource.find(query)
      .populate('skill', 'name category icon')
      .skip(skip)
      .limit(Number(limit))
      .sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single learning resource by ID
 * @route   GET /api/resources/:id
 * @access  Public
 */
const getResourceById = async (req, res, next) => {
  try {
    const resource = await LearningResource.findById(req.params.id).populate('skill');
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create learning resource
 * @route   POST /api/resources
 * @access  Private (Admin, Instructor)
 */
const createResource = async (req, res, next) => {
  try {
    const resource = await LearningResource.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update learning resource
 * @route   PUT /api/resources/:id
 * @access  Private (Admin, Instructor)
 */
const updateResource = async (req, res, next) => {
  try {
    const resource = await LearningResource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete learning resource
 * @route   DELETE /api/resources/:id
 * @access  Private (Admin)
 */
const deleteResource = async (req, res, next) => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
};
