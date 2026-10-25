const express = require('express');
const router = express.Router();
const {
  getAllAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  submitAssessment,
  getMySubmissions,
  getSubmissionById
} = require('../controllers/assessmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllAssessments);
router.get('/submissions/my', protect, getMySubmissions);
router.get('/submissions/:submissionId', protect, getSubmissionById);
router.get('/:id', protect, getAssessmentById);
router.post('/', protect, authorize('admin', 'instructor'), createAssessment);
router.put('/:id', protect, authorize('admin', 'instructor'), updateAssessment);
router.delete('/:id', protect, authorize('admin'), deleteAssessment);
router.post('/:id/submit', protect, submitAssessment);

module.exports = router;
