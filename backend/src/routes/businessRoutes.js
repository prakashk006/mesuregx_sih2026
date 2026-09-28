const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/profile', businessController.getProfile);
router.put('/profile', requireRole(['BUSINESS_OWNER', 'ADMIN']), businessController.updateProfile);
router.get('/dashboard', requireRole(['BUSINESS_OWNER']), businessController.getDashboardStats);

module.exports = router;
