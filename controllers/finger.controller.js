const axios = require('axios');
const BASE_FLASK_API_URL = 'https://zkpi.omegup.tn/';
const DEVICE_ID_HEADER = { headers: { 'Device-ID': 'A8N5230560263' } }; // Define the header once and use it in all requests

/**
 * Enrolls a fingerprint for a specified user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.enrollFinger = async (req, res) => {
  const { uid } = req.params;
  const { fid } = req.query;

  try {
    const response = await axios.post(`${BASE_FLASK_API_URL}/user/${uid}/enroll-finger?fid=${fid}`, {}, DEVICE_ID_HEADER);
    res.json(response.data);
  } catch (error) {
    console.error('Error enrolling finger:', error);
    res.status(500).json({ message: 'Error enrolling finger', details: error.response.data });
  }
};

/**
 * Retrieves all fingerprint templates.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.getTemplates = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_FLASK_API_URL}/templates`, DEVICE_ID_HEADER);
    res.json(response.data);
  } catch (error) {
    console.error('Error retrieving templates:', error.message);
    res.status(error.response.status).json({ message: 'Error retrieving templates', details: error.response.data });
  }
};

/**
 * Retrieves the fingerprint template for a specified user and finger.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.getUserTemplate = async (req, res) => {
  const { uid, fid } = req.params;

  try {
    const response = await axios.get(`${BASE_FLASK_API_URL}/user/${uid}/template/${fid}`, DEVICE_ID_HEADER);
    res.json(response.data);
  } catch (error) {
    console.error('Error retrieving user template:', error);
    res.status(500).json({ message: 'Error retrieving user template', details: error.response.data });
  }
};

/**
 * Sets the fingerprint template for a specified user and finger.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.setUserTemplate = async (req, res) => {
  const { uid, fid } = req.params;
  const templateData = req.body;

  try {
    const response = await axios.put(`${BASE_FLASK_API_URL}/user/${uid}/template/${fid}`, templateData, DEVICE_ID_HEADER);
    res.json(response.data);
  } catch (error) {
    console.error('Error setting user template:', error);
    res.status(500).json({ message: 'Error setting user template', details: error.response.data });
  }
};
