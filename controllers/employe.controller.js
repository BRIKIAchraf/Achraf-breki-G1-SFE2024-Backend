const mongoose = require('mongoose');
const axios = require('axios');
const PDFDocument = require('pdfkit');
const Employe = require('../models/employe.model');
const Attendance = require('../models/attendances.model');
const BASE_FLASK_API_URL = 'https://zkpi.omegup.tn/';
const DEVICE_ID_HEADER = { headers: { 'Device-ID': 'A8N5230560263' } };

// Utility function to sync employee details with the external API
async function syncEmployeeDetails(id, updates) {
  const updatedEmploye = await Employe.findByIdAndUpdate(id, updates, { new: true }).populate('id_planning id_departement');
  try {
    await axios.patch(`${BASE_FLASK_API_URL}/user/${id}`, {
      planning: updatedEmploye.id_planning ? updatedEmploye.id_planning.name : '',
      departement: updatedEmploye.id_departement ? updatedEmploye.id_departement.name : '',
      login_method: updatedEmploye.login_method
    }, DEVICE_ID_HEADER);
  } catch (error) {
    console.error('Error syncing employee details with external API:', error);
  }
}

// Helper function to handle API requests and retry failed requests
async function retryApiRequest(requestFn, retryCount = 3, delay = 2000) {
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt < retryCount - 1) {
        console.log(`Retrying API request, attempt ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('Failed to complete API request after multiple attempts:', error);
        throw error;
      }
    }
  }
}

/**
 * Creates a new employee.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.createEmploye = async (req, res) => {
  try {
    if (!req.body.nom || !req.body.user_id) {
      return res.status(400).json({ message: "'nom' and 'user_id' fields are required." });
    }
    const newEmploye = new Employe({
      ...req.body,
      externalId: req.body.user_id.toString()
    });
    await newEmploye.save();
    try {
      await retryApiRequest(() => syncEmployeeDetails(newEmploye._id, req.body));
    } catch {
      // Log the error but don't prevent the local save
      console.warn('Employee created locally but failed to sync with external API.');
    }
    res.status(201).json(newEmploye);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Error creating employee: ' + error.message });
  }
};

/**
 * Modifies an existing employee.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.modifyEmploye = async (req, res) => {
  const { id } = req.params;
  try {
    await Employe.findByIdAndUpdate(id, req.body, { new: true });
    try {
      await retryApiRequest(() => syncEmployeeDetails(id, req.body));
    } catch {
      // Log the error but don't prevent the local update
      console.warn('Employee updated locally but failed to sync with external API.');
    }
    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee: ' + error.message });
  }
};

/**
 * Deletes an employee.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.deleteEmploye = async (req, res) => {
  const { id } = req.params;
  try {
    const employeToDelete = await Employe.findByIdAndDelete(id);
    if (!employeToDelete) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    try {
      await retryApiRequest(() => axios.delete(`${BASE_FLASK_API_URL}/user/${employeToDelete._id}`, DEVICE_ID_HEADER));
    } catch {
      // Log the error but don't prevent the local delete
      console.warn('Employee deleted locally but failed to delete from external API.');
    }
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee: ' + error.message });
  }
};

/**
 * Generates a PDF report for an employee.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.generateEmployeeReport = async (req, res) => {
  try {
    const { id } = req.params;
    const employe = await Employe.findById(id);
    
    if (!employe) {
      return res.status(404).send('Employé non trouvé');
    }

    // Calculate real-time data such as number of presences, absences, and total hours of delay
    const numberOfPresences = await calculateNumberOfPresences(id);
    const totalHoursOfDelay = await calculateTotalHoursOfDelay(id);

    // Generate PDF report
    const doc = new PDFDocument();
    let filename = encodeURIComponent(employe.nom + "_Rapport") + '.pdf';
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    const content = `Rapport de ${employe.nom}:\n\nNombre de présences: ${numberOfPresences}\nTotal des heures de retard: ${totalHoursOfDelay}\n...`; // Replace placeholders with real-time data

    doc.y = 300;
    doc.text(content, 50, 50);
    doc.pipe(res);
    doc.end();

  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    res.status(500).send('Erreur lors de la génération du rapport');
  }
};

/**
 * Retrieves an employee by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.getEmployeById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  try {
    const employe = await Employe.findById(id).populate('card');
    if (!employe) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employe);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Error fetching employee: ' + error.message });
  }
};

/**
 * Retrieves all employees with pagination and filtering support.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.getAllEmployes = async (req, res) => {
  const { page = 1, limit = 10, name } = req.query;
  const skip = (page - 1) * limit;
  const filters = {};

  if (name) {
    filters.nom = { $regex: new RegExp(name, 'i') };
  }

  try {
    let externalEmployes = [];
    try {
      const response = await retryApiRequest(() => axios.get(`${BASE_FLASK_API_URL}/users`, DEVICE_ID_HEADER));
      externalEmployes = response.data;
      await Promise.all(externalEmployes.map(async (extEmployee) => {
        await Employe.findOneAndUpdate(
          { externalId: extEmployee.uid.toString() },
          {
            externalId: extEmployee.uid.toString(),
            nom: extEmployee.name || "N/A",
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }));
    } catch {
      console.warn('Connection to external API failed. Serving local data.');
    }

    const localEmployes = await Employe.find(filters).skip(skip).limit(limit);
    const totalCount = await Employe.countDocuments(filters);

    res.status(200).json({ employees: localEmployes, totalCount });
  } catch (error) {
    console.error('Error fetching and syncing employees:', error);
    res.status(500).json({ message: 'Error fetching and syncing employees: ' + error.message });
  }
};

const calculateTotalHoursOfDelay = async (employeeId) => {
  try {
    const attendanceRecords = await Attendance.find({ user_id: employeeId });
    let totalDelayHours = 0;

    attendanceRecords.forEach(record => {
      if (record.status === 'present' && record.punch) {
        const threshold = 15 * 60 * 1000;
        const punchTime = new Date(record.punch);
        const expectedEntryTime = new Date(record.timestamp);
        
        const delay = Math.max(punchTime.getTime() - expectedEntryTime.getTime(), 0);
        if (delay > threshold) {
          totalDelayHours += delay / (60 * 60 * 1000);
        }
      }
    });

    return totalDelayHours;
  } catch (error) {
    console.error('Error calculating total hours of delay:', error);
    throw error;
  }
};

const calculateNumberOfPresences = async (employeeId) => {
  try {
    const attendanceRecords = await Attendance.find({ user_id: employeeId, status: 'present' });
    return attendanceRecords.length;
  } catch (error) {
    console.error('Error calculating number of presences:', error);
    throw error;
  }
};
