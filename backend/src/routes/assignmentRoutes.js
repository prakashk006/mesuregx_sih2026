const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

// Listing & History
router.get('/', assignmentController.listAssignments);
router.get('/history/:applicationId', assignmentController.getAssignmentHistory);

// Allocation Actions
router.post('/', requireRole(['OFFICER', 'ADMIN']), assignmentController.assignOfficer);
router.post('/assign', requireRole(['OFFICER', 'ADMIN']), assignmentController.assignAuthority);
router.post('/reassign', requireRole(['ADMIN']), assignmentController.reassignAuthority);
router.post('/accept', requireRole(['GATC', 'OFFICER']), assignmentController.acceptAssignment);
router.post('/reject', requireRole(['GATC', 'OFFICER']), assignmentController.rejectAssignment);

module.exports = router;
