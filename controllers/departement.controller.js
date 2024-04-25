const Departement = require('../models/departement.model');
const Employe = require('../models/employe.model');

// Méthode pour créer un nouveau département
exports.createDepartement = async (req, res) => {
  try {
    const departement = new Departement(req.body);
    await departement.save();
    res.status(201).send(departement);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Méthode pour récupérer tous les départements avec les employés
exports.getAllDepartementsWithEmployees = async (req, res) => {
  try {
    const departements = await Departement.find().populate('employees');
    res.send(departements);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Méthode pour assigner un employé à un département
exports.assignEmployeeToDepartement = async (req, res) => {
  try {
    const { departementId, employeeId } = req.body;

    const departement = await Departement.findById(departementId);
    const employee = await Employe.findById(employeeId);

    if (!departement || !employee) {
      return res.status(404).send({ message: 'Département or employee not found' });
    }

    departement.employees.push(employee);
    await departement.save();

    res.status(200).send({ message: 'Employee assigned to department successfully' });
  } catch (error) {
    res.status(500).send(error);
  }
};

// Méthode pour supprimer un employé d'un département
exports.removeEmployeeFromDepartement = async (req, res) => {
  try {
    const { departementId, employeeId } = req.body;

    const departement = await Departement.findById(departementId);
    const employeeIndex = departement.employees.indexOf(employeeId);

    if (!departement || employeeIndex === -1) {
      return res.status(404).send({ message: 'Département or employee not found in the department' });
    }

    departement.employees.splice(employeeIndex, 1);
    await departement.save();

    res.status(200).send({ message: 'Employee removed from department successfully' });
  } catch (error) {
    res.status(500).send(error);
  }
};
