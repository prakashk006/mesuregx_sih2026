const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticate, optionalAuthenticate, requireRole } = require('../middleware/auth');

// Public or Authenticated can submit a complaint
router.post('/', optionalAuthenticate, complaintController.createComplaint);

// Authenticated routes for listing, viewing, updating
router.use(authenticate);
router.get('/', complaintController.listComplaints);
router.get('/:id', complaintController.getComplaintById);
router.put('/:id/status', requireRole(['OFFICER', 'ADMIN']), complaintController.updateComplaintStatus);
router.put('/:id', requireRole(['OFFICER', 'ADMIN']), complaintController.updateComplaintStatus);
router.patch('/:id', requireRole(['OFFICER', 'ADMIN']), complaintController.updateComplaintStatus);

module.exports = router;
