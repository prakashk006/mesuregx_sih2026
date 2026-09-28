const express = require('express');
const router = express.Router();
const instrumentController = require('../controllers/instrumentController');
const certificateController = require('../controllers/certificateController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/types', instrumentController.getInstrumentTypes);

router.use(authenticate);

router.get('/', instrumentController.listInstruments);
router.post('/', requireRole(['BUSINESS_OWNER', 'ADMIN']), instrumentController.createInstrument);
router.get('/:id/certificates', certificateController.getInstrumentCertificateHistory);
router.get('/:id', instrumentController.getInstrumentById);
router.put('/:id', requireRole(['BUSINESS_OWNER', 'OFFICER', 'ADMIN']), instrumentController.updateInstrument);


module.exports = router;
