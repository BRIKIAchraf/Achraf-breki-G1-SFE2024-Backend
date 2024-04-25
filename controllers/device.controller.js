const axios = require('axios');
const FLASK_API_URL = 'https://zkpi.omegup.tn/';
const DEVICE_ID = 'A8N5230560263';

/**
 * Scans a device.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.scanDevice = (req, res) => {
  axios.post(`${FLASK_API_URL}/devices/scan`, { ...req.body, device_id: DEVICE_ID })
    .then(response => res.json(response.data))
    .catch(error => res.status(error.response ? error.response.status : 500).json({ message: error.message }));
};

/**
 * Pings a device.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.pingDevice = (req, res) => {
  axios.post(`${FLASK_API_URL}/device/${DEVICE_ID}/ping`)
    .then(response => res.json(response.data))
    .catch(error => res.status(error.response ? error.response.status : 500).json({ message: error.message }));
};

/**
 * Lists all devices.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.listDevices = (req, res) => {
  axios.get(`${FLASK_API_URL}/devices`)
    .then(response => res.json(response.data))
    .catch(error => res.status(error.response ? error.response.status : 500).json({ message: error.message }));
};

/**
 * Removes a device.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.removeDevice = (req, res) => {
  axios.delete(`${FLASK_API_URL}/device/${DEVICE_ID}`)
    .then(response => res.json(response.data))
    .catch(error => res.status(error.response ? error.response.status : 500).json({ message: error.message }));
};

/**
 * Updates a device.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.updateDevice = (req, res) => {
  axios.patch(`${FLASK_API_URL}/device/${DEVICE_ID}`, req.body)
    .then(response => res.json(response.data))
    .catch(error => res.status(error.response ? error.response.status : 500).json({ message: error.message }));
};
