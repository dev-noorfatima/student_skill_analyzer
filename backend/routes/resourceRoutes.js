const express = require('express');
const router = express.Router();
const {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllResources);
router.get('/:id', getResourceById);
router.post('/', protect, authorize('admin', 'instructor'), createResource);
router.put('/:id', protect, authorize('admin', 'instructor'), updateResource);
router.delete('/:id', protect, authorize('admin'), deleteResource);

module.exports = router;
