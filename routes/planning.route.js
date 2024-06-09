const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planning.controller'); // Make sure the path matches the location of your controller file

router.post('/', planningController.createPlanningWithJoursAndEmployees);
router.get('/', planningController.getAllPlannings);
router.get('/:id', planningController.getPlanningById);
router.put('/:id', planningController.updatePlanning);
router.put('/delete/:id', planningController.deletePlanning); // Changed to PUT for consistency

module.exports = router;
