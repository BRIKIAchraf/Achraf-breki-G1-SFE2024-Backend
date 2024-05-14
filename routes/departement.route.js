const express = require('express');
const router = express.Router();
const departementController = require('../controllers/departement.controller');

// Route pour créer un nouveau département
router.post('/', departementController.createDepartement);

// Route pour récupérer tous les départements avec les employés
router.get('/', departementController.getAllDepartementsWithEmployees);

// Route pour assigner un employé à un département
router.post('/assign-employee', departementController.assignEmployeeToDepartement);

// Route pour supprimer un employé d'un département
router.delete('/remove-employee/:id', departementController.removeEmployeeFromDepartement);

router.delete('/:id', departementController.deleteDepartement);
module.exports = router;
