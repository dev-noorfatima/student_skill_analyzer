const express = require('express');
const router = express.Router();
const {
  getAllSkills,
  getSkillCategories,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
} = require('../controllers/skillController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllSkills);
router.get('/categories', getSkillCategories);
router.get('/:id', getSkillById);
router.post('/', protect, authorize('admin', 'instructor'), createSkill);
router.put('/:id', protect, authorize('admin', 'instructor'), updateSkill);
router.delete('/:id', protect, authorize('admin'), deleteSkill);

module.exports = router;
