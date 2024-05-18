// routes/apiStatusRoutes.js
const express = require('express');
const { checkExternalApiStatus } = require('../controllers/apiStatus.controller');

const router = express.Router();

router.get('/check-api-status', checkExternalApiStatus);

module.exports = router;
