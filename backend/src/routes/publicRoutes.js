const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/stats', publicController.getPublicStats);
router.get('/verify/:certificateNumber', publicController.verifyPublicCertificate);

module.exports = router;
