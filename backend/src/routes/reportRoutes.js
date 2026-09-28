const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.use(requireRole(['ADMIN', 'OFFICER']));

router.get('/', reportController.getReports);

module.exports = router;
