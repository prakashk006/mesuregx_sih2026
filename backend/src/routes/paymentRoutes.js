const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

// Public / Business demo payment
router.post('/pay-demo', requireRole(['BUSINESS_OWNER', 'ADMIN']), paymentController.payDemo);
router.get('/', paymentController.listPayments);
router.get('/:id', paymentController.getPaymentById);
router.get('/application/:applicationId', paymentController.getPaymentByApplication);

module.exports = router;
