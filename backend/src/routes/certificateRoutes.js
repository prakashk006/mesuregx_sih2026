const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

// List certificates with search, filters, pagination, and RBAC
router.get('/', certificateController.listCertificates);

// Instrument Certificate History
router.get('/instrument/:instrumentId/history', certificateController.getInstrumentCertificateHistory);

// Application Certificate History
router.get('/application/:id/history', certificateController.getApplicationCertificateHistory);

// Certificate History (succession and timeline for the certificate's instrument)
router.get('/:id/history', certificateController.getCertificateHistory);

// Get single certificate details
router.get('/:id', certificateController.getCertificateById);

// Revoke certificate (Officer and Admin)
router.post('/:id/revoke', requireRole(['OFFICER', 'ADMIN']), certificateController.revokeCertificate);

module.exports = router;
