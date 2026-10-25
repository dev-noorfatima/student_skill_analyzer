const {
  Assessment,
  AssessmentSubmission,
  Student,
  StudentSkill,
  Certificate,
  Notification
} = require('../models');

/**
 * @desc    Get all assessments (with filter by skill, difficulty, category)
 * @route   GET /api/assessments
 * @access  Public
 */
const getAllAssessments = async (req, res, next) => {
  try {
    const { category, targetSkill, difficultyLevel, search, page = 1, limit = 15 } = req.query;

    const query = { isPublished: true };
    if (category) query.category = category;
    if (targetSkill) query.targetSkill = targetSkill;
    if (difficultyLevel) query.difficultyLevel = difficultyLevel;
    if (search) query.title = new RegExp(search, 'i');

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Assessment.countDocuments(query);

    const assessments = await Assessment.find(query)
      .select('-questions.options.isCorrect -questions.correctAnswerExplanation')
      .populate('targetSkill', 'name category icon')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assessments.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: assessments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single assessment by ID
 * @route   GET /api/assessments/:id
 * @access  Private
 */
const getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('targetSkill', 'name category icon')
      .populate('additionalSkillsCovered', 'name category');

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Hide correct answers if requested by student taking the test
    let assessmentData = assessment.toObject();
    if (req.user && req.user.role === 'student') {
      assessmentData.questions = assessmentData.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        codeSnippet: q.codeSnippet,
        questionType: q.questionType,
        points: q.points,
        difficulty: q.difficulty,
        options: q.options.map((opt) => ({
          optionId: opt.optionId,
          text: opt.text
        }))
      }));
    }

    res.status(200).json({
      success: true,
      data: assessmentData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new assessment
 * @route   POST /api/assessments
 * @access  Private (Admin, Instructor)
 */
const createAssessment = async (req, res, next) => {
  try {
    const assessmentData = {
      ...req.body,
      createdBy: req.user._id
    };

    const assessment = await Assessment.create(assessmentData);

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update assessment
 * @route   PUT /api/assessments/:id
 * @access  Private (Admin, Instructor)
 */
const updateAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete assessment
 * @route   DELETE /api/assessments/:id
 * @access  Private (Admin)
 */
const deleteAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    await assessment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit assessment answers, auto-grade and update student skill profile
 * @route   POST /api/assessments/:id/submit
 * @access  Private (Student)
 */
const submitAssessment = async (req, res, next) => {
  try {
    const { answers, timeTakenMinutes } = req.body;
    // answers format: [{ questionId, selectedOptionId, textAnswer }]

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Auto grading
    let totalMarksObtained = 0;
    let totalMarksPossible = 0;
    const gradedAnswers = [];
    const weakTopics = [];
    const strengths = [];

    assessment.questions.forEach((q) => {
      totalMarksPossible += q.points;
      const studentAnswer = answers ? answers.find((a) => a.questionId === q._id.toString() || a.questionId === q.questionText) : null;

      let isCorrect = false;
      let marksAwarded = 0;

      if (studentAnswer) {
        const correctOpt = q.options.find((opt) => opt.isCorrect);
        if (correctOpt && studentAnswer.selectedOptionId === correctOpt.optionId) {
          isCorrect = true;
          marksAwarded = q.points;
          totalMarksObtained += q.points;
          strengths.push(q.questionText);
        } else {
          weakTopics.push(q.questionText);
        }
      } else {
        weakTopics.push(q.questionText);
      }

      gradedAnswers.push({
        questionId: q._id.toString(),
        selectedOptionId: studentAnswer ? studentAnswer.selectedOptionId : null,
        textAnswer: studentAnswer ? studentAnswer.textAnswer : null,
        isCorrect,
        marksAwarded,
        timeSpentSeconds: studentAnswer ? studentAnswer.timeSpentSeconds || 0 : 0
      });
    });

    const percentage = totalMarksPossible > 0 ? Math.round((totalMarksObtained / totalMarksPossible) * 100) : 0;
    const passed = percentage >= assessment.passingPercentage;

    // Previous attempt count
    const previousAttempts = await AssessmentSubmission.countDocuments({
      student: student._id,
      assessment: assessment._id
    });

    // Create Submission record
    const submission = await AssessmentSubmission.create({
      student: student._id,
      assessment: assessment._id,
      attemptNumber: previousAttempts + 1,
      answers: gradedAnswers,
      totalMarksObtained,
      totalMarksPossible,
      percentage,
      passed,
      timeTakenMinutes: timeTakenMinutes || 15,
      evaluationFeedback: {
        summary: passed
          ? `Congratulations! You passed with ${percentage}%. You demonstrated good mastery of ${assessment.title}.`
          : `You scored ${percentage}%. Review the recommended concepts and retake the test.`,
        strengths: strengths.slice(0, 3),
        weaknesses: weakTopics.slice(0, 3),
        recommendedTopicsToReview: weakTopics.slice(0, 4)
      }
    });

    // Update Assessment stats
    assessment.totalAttempts += 1;
    assessment.averageScore = Math.round((assessment.averageScore + percentage) / 2);
    await assessment.save();

    // Update or Create StudentSkill with verified assessment results
    let studentSkill = await StudentSkill.findOne({
      student: student._id,
      skill: assessment.targetSkill
    });

    let proficiencyLevel = 'beginner';
    if (percentage >= 85) proficiencyLevel = 'expert';
    else if (percentage >= 70) proficiencyLevel = 'advanced';
    else if (percentage >= 50) proficiencyLevel = 'intermediate';

    if (studentSkill) {
      studentSkill.verifiedByAssessment = true;
      studentSkill.assessmentsCount += 1;
      studentSkill.scorePercentage = Math.max(studentSkill.scorePercentage, percentage);
      studentSkill.proficiencyLevel = proficiencyLevel;
      studentSkill.lastAssessedDate = new Date();
      studentSkill.history.push({
        date: new Date(),
        score: percentage,
        level: proficiencyLevel,
        source: 'quiz_assessment',
        note: `Scored ${percentage}% on ${assessment.title}`
      });
      await studentSkill.save();
    } else {
      await StudentSkill.create({
        student: student._id,
        skill: assessment.targetSkill,
        proficiencyLevel,
        scorePercentage: percentage,
        verifiedByAssessment: true,
        assessmentsCount: 1,
        lastAssessedDate: new Date(),
        history: [
          {
            score: percentage,
            level: proficiencyLevel,
            source: 'quiz_assessment',
            note: `Passed ${assessment.title} with ${percentage}%`
          }
        ]
      });
    }

    // Award badge if score >= 80%
    let badgeAwarded = null;
    if (passed && percentage >= 80) {
      badgeAwarded = await Certificate.create({
        student: student._id,
        title: `${assessment.title} - Mastery Badge`,
        badgeType: 'assessment_cert',
        badgeTier: percentage >= 90 ? 'gold' : 'silver',
        skill: assessment.targetSkill,
        assessment: assessment._id,
        scoreAchieved: percentage,
        credentialId: `CERT-${Date.now().toString(36).toUpperCase()}`
      });
      student.totalBadgesEarned += 1;
    }

    student.totalAssessmentsCompleted += 1;
    await student.save();

    // Send notification
    await Notification.create({
      recipient: req.user._id,
      title: `Assessment Completed: ${assessment.title}`,
      message: `You scored ${percentage}% (${passed ? 'PASSED' : 'FAILED'}).`,
      type: 'assessment_result',
      link: `/analysis/assessment/${submission._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Assessment submitted and evaluated successfully',
      data: {
        submissionId: submission._id,
        totalMarksObtained,
        totalMarksPossible,
        percentage,
        passed,
        proficiencyLevel,
        badgeAwarded,
        feedback: submission.evaluationFeedback
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in student's assessment submissions history
 * @route   GET /api/assessments/submissions/my
 * @access  Private (Student)
 */
const getMySubmissions = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const submissions = await AssessmentSubmission.find({ student: student._id })
      .populate('assessment', 'title category difficultyLevel')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed assessment submission result
 * @route   GET /api/assessments/submissions/:submissionId
 * @access  Private
 */
const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await AssessmentSubmission.findById(req.params.submissionId)
      .populate('assessment')
      .populate('student');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  submitAssessment,
  getMySubmissions,
  getSubmissionById
};
