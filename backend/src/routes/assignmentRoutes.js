const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/', assignmentController.listAssignments);
router.post('/', requireRole(['OFFICER', 'ADMIN']), assignmentController.assignOfficer);

module.exports = router;
