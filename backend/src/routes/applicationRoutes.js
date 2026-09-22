const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/', applicationController.listApplications);
router.post('/', requireRole(['BUSINESS_OWNER', 'ADMIN']), applicationController.createApplication);
router.get('/:id', applicationController.getApplicationById);
router.put('/:id/status', requireRole(['OFFICER', 'ADMIN']), applicationController.updateApplicationStatus);

module.exports = router;
