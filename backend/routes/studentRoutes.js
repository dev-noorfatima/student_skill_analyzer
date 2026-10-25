const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getMyStudentProfile,
  getStudentById,
  updateMyStudentProfile,
  getStudentDashboard,
  deleteStudent
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'instructor', 'mentor'), getAllStudents);
router.get('/profile', protect, getMyStudentProfile);
router.put('/profile', protect, updateMyStudentProfile);
router.get('/:id', protect, getStudentById);
router.get('/:id/dashboard', protect, getStudentDashboard);
router.delete('/:id', protect, authorize('admin'), deleteStudent);

module.exports = router;
