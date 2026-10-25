const { MentorFeedback, Student, Notification } = require('../models');

/**
 * @desc    Get mentor feedback for logged in student or requested student
 * @route   GET /api/feedback
 * @access  Private
 */
const getFeedback = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
      query.student = student._id;
    } else if (req.query.studentId) {
      query.student = req.query.studentId;
    }

    const feedbacks = await MentorFeedback.find(query)
      .populate('mentor', 'name email role avatar')
      .populate('skillRatings.skill', 'name category icon')
      .sort({ sessionDate: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit mentor evaluation / mock interview feedback
 * @route   POST /api/feedback
 * @access  Private (Mentor, Instructor, Admin)
 */
const createFeedback = async (req, res, next) => {
  try {
    const feedback = await MentorFeedback.create({
      ...req.body,
      mentor: req.user._id
    });

    const student = await Student.findById(req.body.student).populate('user');
    if (student && student.user) {
      await Notification.create({
        recipient: student.user._id,
        title: 'New Mentor Feedback Received',
        message: `${req.user.name} posted feedback on your ${feedback.sessionType.replace('_', ' ')}.`,
        type: 'mentor_feedback',
        link: '/profile'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update status of an action item in feedback
 * @route   PUT /api/feedback/:id/action-item/:itemIndex
 * @access  Private (Student)
 */
const updateActionItemStatus = async (req, res, next) => {
  try {
    const { isCompleted } = req.body;
    const feedback = await MentorFeedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback record not found' });
    }

    const index = Number(req.params.itemIndex);
    if (!feedback.recommendedActionItems[index]) {
      return res.status(404).json({ success: false, message: 'Action item index not found' });
    }

    feedback.recommendedActionItems[index].isCompleted = isCompleted;
    await feedback.save();

    res.status(200).json({
      success: true,
      message: 'Action item updated successfully',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFeedback,
  createFeedback,
  updateActionItemStatus
};
