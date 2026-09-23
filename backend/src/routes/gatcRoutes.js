const express = require('express');
const router = express.Router();
const gatcController = require('../controllers/gatcController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

// Public/Authenticated active list for allocation dropdown
router.get('/active', gatcController.getActiveGatcs);

// GATC Dashboard Stats (GATC role or Admin)
router.get('/dashboard', requireRole(['GATC', 'ADMIN']), gatcController.getGatcStats);

// GATC Profile
router.get('/profile', requireRole(['GATC', 'ADMIN']), gatcController.getGatcProfile);
router.put('/profile', requireRole(['GATC']), gatcController.updateGatcProfile);
router.get('/profile/:id', requireRole(['ADMIN']), gatcController.getGatcProfile);

// Admin GATC Management
router.get('/', requireRole(['ADMIN']), gatcController.listGatcs);
router.patch('/:id/status', requireRole(['ADMIN']), gatcController.updateGatcStatus);

module.exports = router;
