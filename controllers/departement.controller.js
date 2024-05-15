const Departement = require('../models/departement.model');
const Employe = require('../models/employe.model');

exports.createDepartement = async (req, res) => {
  try {
    const departement = new Departement(req.body);
    await departement.save();
    res.status(201).send(departement);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getAllDepartementsWithEmployees = async (req, res) => {
  try {
    const departements = await Departement.find().populate('employees');
    res.send(departements);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.assignEmployeeToDepartement = async (req, res) => {
  try {
    const { departementId, employeeId } = req.body;

    const departement = await Departement.findById(departementId);
    const employee = await Employe.findById(employeeId);

    if (!departement || !employee) {
      return res.status(404).send({ message: 'Department or employee not found' });
    }

    employee.id_departement = departement._id;
    await employee.save();

    departement.employees.push(employee);
    await departement.save();

    res.status(200).send({ message: 'Employee assigned to department successfully' });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.removeEmployeeFromDepartement = async (req, res) => {
  try {
    const { departementId, employeeId } = req.body;

    const departement = await Departement.findById(departementId);
    const employee = await Employe.findById(employeeId);

    if (!departement || !employee) {
      return res.status(404).send({ message: 'Department or employee not found' });
    }

    employee.id_departement = null;
    await employee.save();

    departement.employees.pull(employee);
    await departement.save();

    res.status(200).send({ message: 'Employee removed from department successfully' });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.deleteDepartement = async (req, res) => {
  try {
    const { id } = req.params;
    const departement = await Departement.findByIdAndDelete(id);

    if (!departement) {
      return res.status(404).send({ message: 'Department not found' });
    }

    res.send({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).send(error);
  }
};
