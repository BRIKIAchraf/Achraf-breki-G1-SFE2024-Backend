// Import models from their respective files
const Employee = require('../models/employe.model');
const Leave = require('../models/leave.model');
const LoginMethod = require('../models/loginMethod.model');
const Planning = require('../models/planning.model');
const Attendance = require('../models/attendances.model');
const Department = require('../models/departement.model');

// Additional models can be added here as needed

exports.search = async (req, res) => {
  const { query } = req.query;  // Extract the search query from the request query parameters

  try {
    // Search across different models using MongoDB's text search feature
    const employees = await Employee.find({ $text: { $search: query } });
    const leaves = await Leave.find({ $text: { $search: query } });
    const loginMethods = await LoginMethod.find({ $text: { $search: query } });
    const plannings = await Planning.find({ $text: { $search: query } });
    const attendances = await Attendance.find({ $text: { $search: query } });
    const departments = await Department.find({ $text: { $search: query } });

    // Add other resource searches as needed

    // Combine and format the search results
    const results = {
      employees,
      leaves,
      loginMethods,
      plannings,
      attendances,
      departments
      // Add other resource results as needed
    };

    res.status(200).json(results);  // Send the combined search results as JSON
  } catch (error) {
    // Handle any errors during the search operation
    res.status(500).json({ message: 'Error searching: ' + error.message });
  }
};
