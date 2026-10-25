const express = require('express');
const router = express.Router();
const {
  getMyCertificates,
  getCertificateById,
  verifyCredential,
  issueCertificate
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getMyCertificates);
router.get('/verify/:credentialId', verifyCredential);
router.get('/:id', getCertificateById);
router.post('/', protect, authorize('admin', 'instructor'), issueCertificate);

module.exports = router;
