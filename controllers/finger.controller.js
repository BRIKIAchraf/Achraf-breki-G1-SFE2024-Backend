const axios = require('axios');
const LoginMethod = require('../models/loginMethod.model');
const Employe = require('../models/employe.model');

const BASE_FLASK_API_URL = 'http://localhost:3000/';

// Enroll a user's finger
exports.enrollFinger = async (req, res) => {
  const { uid } = req.params;
  const { fid } = req.query;

  try {
    const response = await axios.post(`${BASE_FLASK_API_URL}/user/${uid}/enroll-finger?fid=${fid}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(error.response ? error.response.data : { error: 'An error occurred' });
  }
};

// Retrieve all templates
exports.getTemplates = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_FLASK_API_URL}/templates`);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(error.response ? error.response.data : { error: 'An error occurred' });
  }
};

// Retrieve a specific user's template
exports.getUserTemplate = async (req, res) => {
  const { uid, fid } = req.params;

  try {
    const response = await axios.get(`${BASE_FLASK_API_URL}/user/${uid}/template/${fid}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(error.response ? error.response.data : { error: 'An error occurred' });
  }
};

// Set a user's template
exports.setUserTemplate = async (req, res) => {
  const { uid } = req.params;
  const data = req.body;

  try {
    const response = await axios.put(`${BASE_FLASK_API_URL}/user/${uid}/template/${data.fid}`, data);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(error.response ? error.response.data : { error: 'An error occurred' });
  }
};
