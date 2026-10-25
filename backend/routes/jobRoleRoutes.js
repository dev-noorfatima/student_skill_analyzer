const express = require('express');
const router = express.Router();
const {
  getAllJobRoles,
  getJobRoleById,
  createJobRole,
  updateJobRole,
  deleteJobRole
} = require('../controllers/jobRoleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllJobRoles);
router.get('/:id', getJobRoleById);
router.post('/', protect, authorize('admin'), createJobRole);
router.put('/:id', protect, authorize('admin'), updateJobRole);
router.delete('/:id', protect, authorize('admin'), deleteJobRole);

module.exports = router;
