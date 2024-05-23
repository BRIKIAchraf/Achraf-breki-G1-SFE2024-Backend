// controllers/apiStatusController.js
const axios = require('axios');

const checkExternalApiStatus = async (req, res) => {
  try {
    const response = await axios.get('https://zkpi.omegup.tn/status');
    if (response.status === 200) {
      res.json({ status: 'active', message: 'External API is working fine.' });
    } else {
      res.json({ status: 'en panne', message: 'External API is not working properly.' });
    }
  } catch (error) {
    res.json({ status: 'en panne', message: 'External API is not working properly.' });
  }
};

module.exports = { checkExternalApiStatus };
