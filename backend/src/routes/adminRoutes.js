const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

// Allow both ADMIN and OFFICER roles to access shared dashboard statistics and officer list
router.get('/dashboard', requireRole(['ADMIN', 'OFFICER']), adminController.getAdminDashboardStats);
router.get('/officers', requireRole(['ADMIN', 'OFFICER']), adminController.listOfficers);

router.use(requireRole(['ADMIN']));
router.get('/users', adminController.listUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.post('/officers', adminController.addOfficer);
router.get('/rules', adminController.listRules);
router.post('/rules', adminController.createRule);
router.put('/rules/:id/toggle', adminController.toggleRule);
router.get('/audit-logs', adminController.listAuditLogs);

module.exports = router;
