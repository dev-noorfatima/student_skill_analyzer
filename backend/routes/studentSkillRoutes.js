const express = require('express');
const router = express.Router();
const {
  getMySkills,
  addSkillToStudent,
  updateStudentSkill,
  deleteStudentSkill,
  endorseSkill
} = require('../controllers/studentSkillController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getMySkills);
router.post('/', protect, addSkillToStudent);
router.put('/:id', protect, updateStudentSkill);
router.delete('/:id', protect, deleteStudentSkill);
router.post('/:id/endorse', protect, authorize('mentor', 'instructor', 'admin'), endorseSkill);

module.exports = router;
