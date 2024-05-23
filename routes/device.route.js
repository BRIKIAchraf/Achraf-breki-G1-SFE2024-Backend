const express = require('express');
const { syncDevices, listDevices, removeDevice } = require('../controllers/device.controller');

const router = express.Router();

router.get('/sync-devices', syncDevices);
router.get('/devices', deviceController.listDevices);
router.post('/devices/sync', deviceController.syncDevices);
router.post('/devices/scan/port', deviceController.scanByPort);
router.post('/devices/scan/inet', deviceController.scanByInet);
router.post('/device/:id/ping', deviceController.pingDevice);
router.patch('/device/:id', deviceController.updateDevice);
router.delete('/device/:id', deviceController.removeDevice);
module.exports = router;
