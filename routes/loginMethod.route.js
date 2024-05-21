const express = require('express');
const router = express.Router();
const loginMethodController = require('../controllers/loginMethod.controller'); // Ensure this path is correct

router.get('/', loginMethodController.getAllowedLoginMethods);
router.post('/add', loginMethodController.addLoginMethod);
router.post('/assign', loginMethodController.assignLoginMethod);
router.get('/list', loginMethodController.listLoginMethods);
router.post('/unassign', loginMethodController.unassignLoginMethod);
router.put('/update/:id', loginMethodController.modifyLoginMethod); // Corrected the endpoint to use the modifyLoginMethod function
router.delete('/delete/:id', loginMethodController.deleteLoginMethod); // Added delete endpoint

module.exports = router;
