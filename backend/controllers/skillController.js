const { Skill, LearningResource, Assessment } = require('../models');

/**
 * @desc    Get all skills (with search, category filter, demand score sort)
 * @route   GET /api/skills
 * @access  Public
 */
const getAllSkills = async (req, res, next) => {
  try {
    const { category, search, sort = '-industryDemandScore', page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { subcategory: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Skill.countDocuments(query);

    const skills = await Skill.find(query)
      .populate('prerequisites', 'name category')
      .populate('relatedSkills', 'name category')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: skills.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: skills
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get distinct skill categories
 * @route   GET /api/skills/categories
 * @access  Public
 */
const getSkillCategories = async (req, res, next) => {
  try {
    const categories = await Skill.distinct('category', { isActive: true });
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single skill by ID or Slug
 * @route   GET /api/skills/:id
 * @access  Public
 */
const getSkillById = async (req, res, next) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };

    const skill = await Skill.findOne(query)
      .populate('prerequisites', 'name category icon')
      .populate('relatedSkills', 'name category icon');

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Fetch related learning resources and assessments
    const resources = await LearningResource.find({ skill: skill._id, isActive: true });
    const assessments = await Assessment.find({ targetSkill: skill._id, isPublished: true }).select(
      'title category difficultyLevel durationMinutes totalMarks passingPercentage'
    );

    res.status(200).json({
      success: true,
      data: {
        skill,
        resources,
        assessments
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new skill
 * @route   POST /api/skills
 * @access  Private (Admin, Instructor)
 */
const createSkill = async (req, res, next) => {
  try {
    const skill = await Skill.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: skill
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a skill
 * @route   PUT /api/skills/:id
 * @access  Private (Admin, Instructor)
 */
const updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: skill
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a skill
 * @route   DELETE /api/skills/:id
 * @access  Private (Admin)
 */
const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    await skill.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSkills,
  getSkillCategories,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
};
