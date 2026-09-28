const express = require('express');
const router = express.Router();
const enforcementController = require('../controllers/enforcementController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

// List cases, businesses & get details
router.get('/', enforcementController.listCases);
router.get('/businesses', enforcementController.listBusinesses);
router.get('/:id', enforcementController.getCaseById);

// Admin & Officer creation and management
router.post('/', requireRole(['ADMIN', 'OFFICER']), enforcementController.createCase);
router.post('/:id/actions', requireRole(['ADMIN', 'OFFICER']), enforcementController.addAction);
router.post('/:id/evidence', requireRole(['ADMIN', 'OFFICER']), enforcementController.addEvidence);
router.put('/:id/status', requireRole(['ADMIN', 'OFFICER']), enforcementController.updateCaseStatus);

module.exports = router;
