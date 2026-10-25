const {
  Student,
  User,
  StudentSkill,
  AssessmentSubmission,
  Analysis,
  Project,
  Certificate
} = require('../models');

/**
 * @desc    Get all students (with search, filter, pagination)
 * @route   GET /api/students
 * @access  Private (Admin, Instructor, Mentor)
 */
const getAllStudents = async (req, res, next) => {
  try {
    const { department, semester, search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (department) query.department = new RegExp(department, 'i');
    if (semester) query.currentSemester = Number(semester);

    const skip = (Number(page) - 1) * Number(limit);

    let students = await Student.find(query)
      .populate('user', 'name email avatar role')
      .populate('targetCareerRole', 'title category')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      students = students.filter(
        (s) =>
          (s.user && searchRegex.test(s.user.name)) ||
          (s.rollNumber && searchRegex.test(s.rollNumber))
      );
    }

    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in student profile
 * @route   GET /api/students/profile
 * @access  Private (Student)
 */
const getMyStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate('user', 'name email avatar phone')
      .populate('targetCareerRole')
      .populate({
        path: 'skills',
        populate: { path: 'skill', select: 'name category icon' }
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student profile by ID
 * @route   GET /api/students/:id
 * @access  Private
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('targetCareerRole');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current logged in student profile
 * @route   PUT /api/students/profile
 * @access  Private (Student)
 */
const updateMyStudentProfile = async (req, res, next) => {
  try {
    let student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const allowedFields = [
      'rollNumber',
      'registrationNumber',
      'institution',
      'department',
      'major',
      'currentSemester',
      'academicYear',
      'cgpa',
      'targetCareerRole',
      'targetCareerTitle',
      'bio',
      'socialProfiles',
      'resumeUrl',
      'preferredLearningStyle',
      'interests'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comprehensive dashboard stats for a student
 * @route   GET /api/students/:id/dashboard
 * @access  Private
 */
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId).populate('user', 'name email avatar').populate('targetCareerRole');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // 1. Fetch Student Skills
    const studentSkills = await StudentSkill.find({ student: studentId }).populate('skill', 'name category icon');

    // Calculate level distributions
    const levelCounts = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
    let totalScoreSum = 0;
    studentSkills.forEach((s) => {
      if (levelCounts[s.proficiencyLevel] !== undefined) {
        levelCounts[s.proficiencyLevel]++;
      }
      totalScoreSum += s.scorePercentage || 0;
    });

    const averageSkillScore = studentSkills.length > 0 ? Math.round(totalScoreSum / studentSkills.length) : 0;

    // 2. Fetch Latest Analysis
    const latestAnalysis = await Analysis.findOne({ student: studentId })
      .sort({ createdAt: -1 })
      .populate('targetRole', 'title');

    // 3. Fetch Recent Assessment Submissions
    const recentSubmissions = await AssessmentSubmission.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assessment', 'title category difficultyLevel');

    // 4. Fetch Projects
    const projects = await Project.find({ student: studentId });

    // 5. Fetch Badges/Certificates
    const certificates = await Certificate.find({ student: studentId });

    res.status(200).json({
      success: true,
      data: {
        student,
        stats: {
          totalSkills: studentSkills.length,
          levelCounts,
          averageSkillScore,
          readinessScore: latestAnalysis ? latestAnalysis.overallReadinessScore : 0,
          readinessStatus: latestAnalysis ? latestAnalysis.readinessStatus : 'needs_foundation',
          totalAssessmentsTaken: recentSubmissions.length,
          totalProjects: projects.length,
          totalBadges: certificates.length
        },
        skills: studentSkills,
        latestAnalysis,
        recentSubmissions,
        projects,
        certificates
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete student profile
 * @route   DELETE /api/students/:id
 * @access  Private (Admin)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Student profile removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  getMyStudentProfile,
  getStudentById,
  updateMyStudentProfile,
  getStudentDashboard,
  deleteStudent
};
