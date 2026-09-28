const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { authenticate, requireRole } = require('../middleware/auth');
const { uploadEvidence } = require('../middleware/upload');

router.use(authenticate);

router.post('/evaluate-live', requireRole(['OFFICER', 'ADMIN']), verificationController.evaluateLive);
router.get('/application/:applicationId', verificationController.getVerificationByAppId);
router.post('/submit', requireRole(['OFFICER', 'ADMIN']), verificationController.submitVerification);
router.post('/evidence/upload', requireRole(['OFFICER', 'ADMIN']), uploadEvidence.single('photo'), verificationController.uploadEvidence);
router.delete('/evidence/:id', requireRole(['OFFICER', 'ADMIN']), verificationController.deleteEvidence);
router.post('/decision/:applicationId', requireRole(['OFFICER', 'ADMIN']), verificationController.officerDecision);

module.exports = router;
