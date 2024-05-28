const express = require('express');
const {
  scanDevice,
  getAllDevices,
  pingDevice,
  removeDevice,
  updateDevice
} = require('../controllers/deviceController');

const router = express.Router();

router.post('/devices/scan', scanDevice);
router.get('/', getAllDevices);
router.post('/device/:device_id/ping', pingDevice);
router.delete('/device/:device_id', removeDevice);
router.patch('/device/:device_id', updateDevice);

module.exports = router;
