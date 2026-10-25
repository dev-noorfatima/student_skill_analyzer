const express = require('express');
const router = express.Router();
const {
  getLearningPaths,
  getLearningPathById,
  createLearningPath,
  enrollInLearningPath,
  updateMilestone
} = require('../controllers/learningPathController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getLearningPaths);
router.get('/:id', getLearningPathById);
router.post('/', protect, authorize('admin', 'instructor'), createLearningPath);
router.post('/:id/enroll', protect, enrollInLearningPath);
router.put('/:id/milestone/:stepNumber', protect, updateMilestone);

module.exports = router;
