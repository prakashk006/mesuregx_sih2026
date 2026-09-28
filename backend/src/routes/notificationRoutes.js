const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', notificationController.listNotifications);
router.put('/:id/read', notificationController.markNotificationAsRead);

// Trigger on-demand expiry scan (Admin & Officer)
router.post('/run-expiry-check', async (req, res, next) => {
  try {
    const { runExpiryAlertScan } = require('../services/expiryAlertService');
    const result = await runExpiryAlertScan(req.user.id);
    res.json({
      success: true,
      message: `Expiry scan complete: ${result.totalScanned} certificates scanned, ${result.alertsSent} alert notifications sent, ${result.expiredMarked} marked expired.`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
