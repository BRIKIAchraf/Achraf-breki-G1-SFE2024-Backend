const mongoose = require('mongoose');
const axios = require('axios');
const PDFDocument = require('pdfkit');
const Employe = require('../models/employe.model');
const Attendance = require('../models/attendances.model');
const BASE_FLASK_API_URL = 'http://localhost:5000';
const DEVICE_ID_HEADER = { headers: { 'Device-ID': 'A8N5230560263' } };

/**
 * Creates a new employee.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.createEmploye = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.nom || !req.body.user_id) {
      return res.status(400).json({ message: "'nom' and 'user_id' fields are required." });
    }

    // Create a new employee instance
    const newEmploye = new Employe({
      ...req.body,
      externalId: req.body.user_id.toString(), // Set externalId based on user_id
      prenom: req.body.prenom || "N/A",
      date_naissance: req.body.date_naissance || new Date(),
      login_method: req.body.login_method || "PassOrFingerOrCard",
      type: req.body.type || "Permanent"
    });

    // Save the new employee to the database
    await newEmploye.save();

    // Prepare data for external API
    const externalEmploye = {
      uid: newEmploye.user_id.toString(),
      name: newEmploye.nom,
      card: parseInt(req.body.card, 10) || 0,
      group_id: req.body.group_id || "",
      password: req.body.password || "",
      privilege: parseInt(req.body.privilege, 10) || 0
    };

    // Send employee data to external API
    console.log('Sending to external API:', externalEmploye);
    await axios.post(`${BASE_FLASK_API_URL}/users`, externalEmploye, DEVICE_ID_HEADER);
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
    // Find and update the employee
    const updatedEmploye = await Employe.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedEmploye) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Prepare data for external API
    const externalEmploye = {
      name: updatedEmploye.nom,
    };

    // Update employee data in external API
    console.log('Updating external API:', externalEmploye);
    await axios.patch(`${BASE_FLASK_API_URL}/user/${updatedEmploye._id}`, externalEmploye, DEVICE_ID_HEADER);
    res.status(200).json(updatedEmploye);
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
    // Find and delete the employee
    const employeToDelete = await Employe.findByIdAndDelete(id);
    if (!employeToDelete) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete the employee from the external API
    console.log('Deleting from external API: user_id', employeToDelete._id);
    await axios.delete(`${BASE_FLASK_API_URL}/user/${employeToDelete._id}`, DEVICE_ID_HEADER);
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
    // Find employee by ID and populate card details
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
 * Retrieves all employees and syncs with external API.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.getAllEmployes = async (req, res) => {
  try {
    // Fetch employees from external API
    const response = await axios.get(`${BASE_FLASK_API_URL}/users`, DEVICE_ID_HEADER);
    await Promise.all(response.data.map(async (extEmployee) => {
      // Upsert employee data in the local database
      await Employe.findOneAndUpdate(
        { externalId: extEmployee.uid.toString() },
        {
          externalId: extEmployee.uid.toString(),
          nom: extEmployee.name || "N/A",
          // map other fields as necessary
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }));

    // Retrieve and return local employees
    const localEmployes = await Employe.find();
    res.status(200).json(localEmployes);
  } catch (error) {
    console.error('Error fetching and syncing employees:', error);
    res.status(500).json({ message: 'Error fetching and syncing employees: ' + error.message });
  }
};

// Helper function to calculate the total hours of delay based on attendance records
const calculateTotalHoursOfDelay = async (employeeId) => {
  try {
    // Fetch attendance records for the employee
    const attendanceRecords = await Attendance.find({ user_id: employeeId });
    let totalDelayHours = 0;

    // Iterate through each attendance record
    attendanceRecords.forEach(record => {
      // Calculate delay for each record (if status is 'present' and there is a punch time)
      if (record.status === 'present' && record.punch) {
        // Consider a threshold for defining a delay (e.g., 15 minutes)
        const threshold = 15 * 60 * 1000; // 15 minutes in milliseconds
        const punchTime = new Date(record.punch);
        const expectedEntryTime = new Date(record.timestamp);
        
        // Calculate the delay
        const delay = Math.max(punchTime.getTime() - expectedEntryTime.getTime(), 0);
        
        // If the delay is greater than the threshold, add it to the total delay hours
        if (delay > threshold) {
          totalDelayHours += delay / (1