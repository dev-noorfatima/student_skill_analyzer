const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getMyProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  reviewProject
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllProjects);
router.get('/my', protect, getMyProjects);
router.get('/:id', getProjectById);
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/review', protect, authorize('mentor', 'instructor', 'admin'), reviewProject);

module.exports = router;
