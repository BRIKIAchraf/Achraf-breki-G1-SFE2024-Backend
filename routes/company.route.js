const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');

router.post('/company', companyController.createOrUpdateCompany);
router.get('/company', companyController.getCompany);

module.exports = router;
