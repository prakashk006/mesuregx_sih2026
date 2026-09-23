const express = require('express');
const router = express.Router();
const enforcementController = require('../controllers/enforcementController');
const { authenticate, requireRole } = require('../middleware/auth');
const { uploadEvidence } = require('../middleware/upload');

// All enforcement routes require authentication
router.use(authenticate);

// Public verifiers/citizens have no access to internal enforcement cases.
// Business owners can view their own cases; Officers and Admins have operational management.
router.get('/stats', enforcementController.getEnforcementStats);
router.get('/analytics', requireRole(['OFFICER', 'ADMIN']), enforcementController.getEnforcementAnalytics);
router.get('/linkable-records', requireRole(['OFFICER', 'ADMIN']), enforcementController.getLinkableRecords);
router.get('/', enforcementController.listEnforcementCases);
router.post('/', requireRole(['OFFICER', 'ADMIN']), enforcementController.createEnforcementCase);

router.get('/:id', enforcementController.getEnforcementCaseById);
router.put('/:id/status', requireRole(['OFFICER', 'ADMIN']), enforcementController.updateEnforcementStatus);
router.post('/:id/actions', requireRole(['OFFICER', 'ADMIN']), enforcementController.recordEnforcementAction);
router.post(
  '/:id/evidence',
  requireRole(['OFFICER', 'ADMIN']),
  uploadEvidence.single('file'),
  enforcementController.addEnforcementEvidence
);
router.post('/:id/mobile-sync', requireRole(['OFFICER', 'ADMIN']), enforcementController.mobileSyncEnforcement);

module.exports = router;
