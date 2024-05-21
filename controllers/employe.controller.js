const mongoose = require('mongoose');
const axios = require('axios');
const PDFDocument = require('pdfkit');
const Employe = require('../models/employe.model');
const Attendance = require('../models/attendances.model');
const BASE_FLASK_API_URL = 'https://zkpi.omegup.tn/';
const DEVICE_ID_HEADER = { headers: { 'Device-ID': 'A8N5230560263' } };
const { v4: uuidv4 } = require('uuid'); // Ensure you import uuidv4 correctly

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

exports.createEmploye = async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom) {
      return res.status(400).json({ message: "'nom' field is required." });
    }
    console.log('...........')

    let pictureUrl = '';
    if (req.file) {
      pictureUrl = `/uploads/${req.file.filename}`;
    }

    const newEmploye = new Employe({
      ...req.body,
      user_id: uuidv4(),
      picture: pictureUrl
    });

    console.log('Creating new employee:', newEmploye); // Log new employee details

    await newEmploye.save();

    console.log('New employee created successfully:', newEmploye); // Log successful creation

    try {
      await retryApiRequest(() => syncEmployeeDetails(newEmploye._id, req.body));
    } catch {
      console.warn('Employee created locally but failed to sync with external API.');
    }
    res.status(201).json(newEmploye);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Error creating employee: ' + error.message });
  }
};

exports.modifyEmploye = async (req, res) => {
  const { id } = req.params;
  try {
    let updates = req.body;
    if (req.file) {
      updates.picture = `/uploads/${req.file.filename}`;
    }
    await Employe.findByIdAndUpdate(id, updates, { new: true });
    try {
      await retryApiRequest(() => syncEmployeeDetails(id, updates));
    } catch {
      console.warn('Employee updated locally but failed to sync with external API.');
    }
    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee: ' + error.message });
  }
};

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
      console.warn('Employee deleted locally but failed to delete from external API.');
    }
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee: ' + error.message });
  }
};

exports.generateEmployeeReport = async (req, res) => {
  try {
    const { id } = req.params;
    const employe = await Employe.findById(id);
    
    if (!employe) {
      return res.status(404).send('Employé non trouvé');
    }

    const numberOfPresences = await calculateNumberOfPresences(id);
    const totalHoursOfDelay = await calculateTotalHoursOfDelay(id);

    const doc = new PDFDocument();
    let filename = encodeURIComponent(employe.nom + "_Rapport") + '.pdf';
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    const content = `Rapport de ${employe.nom}:\n\nNombre de présences: ${numberOfPresences}\nTotal des heures de retard: ${totalHoursOfDelay}\n...`;

    doc.y = 300;
    doc.text(content, 50, 50);
    doc.pipe(res);
    doc.end();

  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    res.status(500).send('Erreur lors de la génération du rapport');
  }
};

exports.getEmployeById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  try {
    const employe = await Employe.findById(id).populate('id_departement');
    if (!employe) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employe);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Error fetching employee: ' + error.message });
  }
};

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

    const localEmployes = await Employe.find(filters).skip(skip).limit(limit).populate('id_departement');
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
