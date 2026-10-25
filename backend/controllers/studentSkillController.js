const { StudentSkill, Student, Skill } = require('../models');

/**
 * @desc    Get all skills for logged in student
 * @route   GET /api/student-skills
 * @access  Private (Student)
 */
const getMySkills = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const skills = await StudentSkill.find({ student: student._id })
      .populate('skill', 'name slug category icon industryDemandScore')
      .populate('endorsements.mentor', 'name role avatar');

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a skill to student's profile
 * @route   POST /api/student-skills
 * @access  Private (Student)
 */
const addSkillToStudent = async (req, res, next) => {
  try {
    const { skillId, selfAssessedLevel, scorePercentage } = req.body;

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found in catalog' });
    }

    // Check if already added
    const existing = await StudentSkill.findOne({ student: student._id, skill: skillId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This skill is already in your profile. You can update your proficiency instead.'
      });
    }

    const level = selfAssessedLevel || 'beginner';
    const score = scorePercentage !== undefined ? scorePercentage : 25;

    const studentSkill = await StudentSkill.create({
      student: student._id,
      skill: skillId,
      proficiencyLevel: level,
      selfAssessedLevel: level,
      scorePercentage: score,
      history: [
        {
          score,
          level,
          source: 'self_assessment',
          note: 'Initial skill added by student'
        }
      ]
    });

    const populatedSkill = await StudentSkill.findById(studentSkill._id).populate('skill', 'name category icon');

    res.status(201).json({
      success: true,
      message: 'Skill added to profile successfully',
      data: populatedSkill
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a student's skill proficiency
 * @route   PUT /api/student-skills/:id
 * @access  Private (Student)
 */
const updateStudentSkill = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const studentSkill = await StudentSkill.findOne({
      _id: req.params.id,
      student: student._id
    });

    if (!studentSkill) {
      return res.status(404).json({ success: false, message: 'Student skill record not found' });
    }

    const { proficiencyLevel, selfAssessedLevel, scorePercentage } = req.body;

    if (proficiencyLevel) studentSkill.proficiencyLevel = proficiencyLevel;
    if (selfAssessedLevel) studentSkill.selfAssessedLevel = selfAssessedLevel;
    if (scorePercentage !== undefined) studentSkill.scorePercentage = scorePercentage;

    studentSkill.history.push({
      date: new Date(),
      score: studentSkill.scorePercentage,
      level: studentSkill.proficiencyLevel,
      source: 'self_assessment',
      note: 'Skill proficiency updated by student'
    });

    await studentSkill.save();

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: studentSkill
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a skill from student profile
 * @route   DELETE /api/student-skills/:id
 * @access  Private (Student)
 */
const deleteStudentSkill = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const studentSkill = await StudentSkill.findOneAndDelete({
      _id: req.params.id,
      student: student._id
    });

    if (!studentSkill) {
      return res.status(404).json({ success: false, message: 'Student skill record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Skill removed from profile successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mentor endorses a student skill
 * @route   POST /api/student-skills/:id/endorse
 * @access  Private (Mentor, Instructor, Admin)
 */
const endorseSkill = async (req, res, next) => {
  try {
    const { comment, verifiedLevel } = req.body;

    const studentSkill = await StudentSkill.findById(req.params.id);
    if (!studentSkill) {
      return res.status(404).json({ success: false, message: 'Student skill record not found' });
    }

    studentSkill.verifiedByMentor = true;
    studentSkill.verifiedBy = req.user._id;

    if (verifiedLevel) {
      studentSkill.proficiencyLevel = verifiedLevel;
    }

    studentSkill.endorsements.push({
      mentor: req.user._id,
      comment: comment || 'Skill endorsed based on performance',
      endorsedAt: new Date()
    });

    studentSkill.history.push({
      date: new Date(),
      score: studentSkill.scorePercentage,
      level: studentSkill.proficiencyLevel,
      source: 'mentor_evaluation',
      note: `Endorsed by ${req.user.name}`
    });

    await studentSkill.save();

    res.status(200).json({
      success: true,
      message: 'Skill endorsed successfully',
      data: studentSkill
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMySkills,
  addSkillToStudent,
  updateStudentSkill,
  deleteStudentSkill,
  endorseSkill
};
