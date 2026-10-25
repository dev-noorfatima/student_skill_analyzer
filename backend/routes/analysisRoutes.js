const express = require('express');
const router = express.Router();
const {
  generateAnalysis,
  getLatestAnalysis,
  getAnalysisHistory,
  getAnalysisById
} = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateAnalysis);
router.get('/latest', protect, getLatestAnalysis);
router.get('/history', protect, getAnalysisHistory);
router.get('/:id', protect, getAnalysisById);

module.exports = router;
