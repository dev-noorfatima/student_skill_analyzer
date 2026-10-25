const express = require('express');
const router = express.Router();
const {
  getFeedback,
  createFeedback,
  updateActionItemStatus
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getFeedback);
router.post('/', protect, authorize('mentor', 'instructor', 'admin'), createFeedback);
router.put('/:id/action-item/:itemIndex', protect, updateActionItemStatus);

module.exports = router;
