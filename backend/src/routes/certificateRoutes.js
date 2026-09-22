const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/', certificateController.listCertificates);
router.get('/:id', certificateController.getCertificateById);
router.post('/:id/revoke', requireRole(['OFFICER', 'ADMIN']), certificateController.revokeCertificate);

module.exports = router;
