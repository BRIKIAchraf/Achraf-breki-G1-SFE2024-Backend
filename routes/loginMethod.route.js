// loginMethod.router.js

const express = require('express');
const router = express.Router();
const loginMethodController = require('../controllers/loginMethod.controller'); // Check this path is correct

router.post('/add', loginMethodController.addLoginMethod);
router.post('/assign', loginMethodController.assignLoginMethod);
router.get('/list', loginMethodController.listLoginMethods);
//router.post('/unassign', loginMethodController.unassignLoginMethod);

module.exports = router;
