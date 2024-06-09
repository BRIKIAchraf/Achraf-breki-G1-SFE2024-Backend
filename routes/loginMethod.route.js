const express = require('express');
const router = express.Router();
const loginMethodController = require('../controllers/loginMethod.controller');

router.get('/', loginMethodController.getAllowedLoginMethods);
router.post('/add', loginMethodController.addLoginMethod);
router.post('/assign', loginMethodController.assignLoginMethod);
router.get('/list', loginMethodController.listLoginMethods);
router.post('/unassign', loginMethodController.unassignLoginMethod);
router.put('/update/:id', loginMethodController.modifyLoginMethod);
router.put('/delete/:id', loginMethodController.deleteLoginMethod); // Changed to PUT for soft delete

module.exports = router;
