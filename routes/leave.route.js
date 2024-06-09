const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');

router.post('/assign', leaveController.assignLeave);
router.put('/revoke/:leaveId', leaveController.revokeLeave); // Changed to PUT for consistency
router.put('/modify/:leaveId', leaveController.modifyLeave);
router.get('/list', leaveController.listLeaves);
router.get('/employees-for-leaves', leaveController.getEmployeesForLeaves);
router.get('/:leaveId', leaveController.getLeaveById); // Ensure this endpoint exists

module.exports = router;
