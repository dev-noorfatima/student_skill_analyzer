const { Certificate, Student } = require('../models');

/**
 * @desc    Get student's certificates and badges
 * @route   GET /api/certificates
 * @access  Private (Student)
 */
const getMyCertificates = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const certificates = await Certificate.find({ student: student._id })
      .populate('skill', 'name category icon')
      .populate('assessment', 'title category')
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get certificate by ID
 * @route   GET /api/certificates/:id
 * @access  Public
 */
const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email avatar' }
      })
      .populate('skill')
      .populate('assessment');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Public certificate verification by credential ID
 * @route   GET /api/certificates/verify/:credentialId
 * @access  Public
 */
const verifyCredential = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ credentialId: req.params.credentialId })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name avatar' }
      })
      .populate('skill', 'name category')
      .populate('assessment', 'title');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'No credential found with this ID'
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      message: 'Credential verified successfully',
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Issue a manual certificate or badge
 * @route   POST /api/certificates
 * @access  Private (Admin, Instructor)
 */
const issueCertificate = async (req, res, next) => {
  try {
    const credentialId = req.body.credentialId || `CERT-${Date.now().toString(36).toUpperCase()}`;

    const cert = await Certificate.create({
      ...req.body,
      credentialId
    });

    // Update student badge count
    await Student.findByIdAndUpdate(req.body.student, {
      $inc: { totalBadgesEarned: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Certificate/Badge issued successfully',
      data: cert
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCertificates,
  getCertificateById,
  verifyCredential,
  issueCertificate
};
