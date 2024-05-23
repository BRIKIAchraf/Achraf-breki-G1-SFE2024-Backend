const axios = require('axios');
const mongoose = require('mongoose');
const Attendance = require('../models/attendances.model');
const Employe = require('../models/employe.model');
const BASE_FLASK_API_URL = 'https://zkpi.omegup.tn';
const DEVICE_ID_HEADER = { headers: { 'Device-ID': 'A8N5230560263' } };

// Function to perform the synchronization
async function synchronizeAttendances() {
  console.log('Running scheduled job to fetch and sync attendances.');
  try {
    const response = await axios.get(`${BASE_FLASK_API_URL}/attendances`, DEVICE_ID_HEADER);
    console.log('Fetched attendances from external API:', response.data);

    const operations = response.data.map(attendance => ({
      updateOne: {
        filter: { uid: attendance.uid, timestamp: new Date(attendance.timestamp) },
        update: { ...attendance, user_id: attendance.user_id },
        upsert: true
      }
    }));

    if (operations.length === 0) {
      console.warn('No valid attendances to synchronize.');
      return;
    }

    await Attendance.bulkWrite(operations);
    console.log('Attendances synchronized successfully.');
  } catch (error) {
    console.error('Error during scheduled attendance fetch:', error);
  }
}

// Scheduled task to fetch and synchronize attendance data every 5 seconds
setInterval(synchronizeAttendances, 9000000);

exports.manualSyncAttendances = async (req, res) => {
  try {
    await synchronizeAttendances();
    res.status(200).json({ message: 'Manual sync triggered. Check server logs for output.' });
  } catch (error) {
    console.error('Error manually triggering attendance sync:', error);
    res.status(error.response ? error.response.status : 500).json({ message: error.message });
  }
};

/**
 * Fetches attendances data from the external Flask API, syncs it with the local database,
 * and responds with the updated attendances.
 * If the external API fails, responds with the local data.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.getAttendances = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    // Build filter query
    const filterQuery = {};
    for (const key in filters) {
      if (Object.hasOwnProperty.call(filters, key)) {
        filterQuery[key] = { $regex: new RegExp(filters[key], 'i') };
      }
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
      // Fetch attendances data from the Flask API with filters
      console.log('Fetching attendances from external API with filters:', filterQuery);
      const response = await axios.get(`${BASE_FLASK_API_URL}/attendances`, {
        headers: { 'Device-ID': 'A8N5230560263' },
        params: filterQuery
      });

      if (response.data.length === 0) {
        console.log('No attendances found from external API.');
      } else {
        console.log(`Fetched ${response.data.length} attendances from external API.`);
      }

      // Map and format the fetched attendances data
      const attendances = response.data.map(attendance => ({
        punch: attendance.punch,
        status: attendance.status,
        timestamp: new Date(attendance.timestamp),
        uid: attendance.uid,
        user_id: attendance.user_id // Handle user_id as a string
      }));

      console.log('Mapped attendances:', attendances);

      // Insert the formatted attendances data into the local database
      await Attendance.deleteMany({});
      console.log('Cleared existing attendances from local database.');

      await Attendance.insertMany(attendances);
      console.log('Inserted new attendances into local database.');

      // Paginate the results
      const paginatedAttendances = attendances.slice(startIndex, endIndex);
      console.log('Paginated attendances:', paginatedAttendances);

      // Fetch employee details for each attendance
      const attendancesWithEmployeeDetails = await Promise.all(paginatedAttendances.map(async (attendance) => {
        const employee = await Employe.findOne({ user_id: attendance.user_id }).populate('id_departement');
        if (employee) {
          console.log(`Found employee for user_id ${attendance.user_id}:`, employee);
        } else {
          console.log(`No employee found for user_id ${attendance.user_id}`);
        }
        return {
          ...attendance,
          firstName: employee ? employee.prenom : '',
          lastName: employee ? employee.nom : '',
          loginMethod: employee ? employee.login_method : '',
          department: employee && employee.id_departement ? employee.id_departement.name : 'Il n\'appartient pas à un département',
          punchStatus: attendance.punch === 0 ? 'Missing' : 'Completed',
          activeStatus: attendance.status === 1 ? 'Active' : 'Inactive',
        };
      }));

      // Respond with the paginated attendances with employee details
      res.status(200).json(attendancesWithEmployeeDetails);

    } catch (error) {
      console.warn('Connection to external API failed. Serving local data.');
      console.error('Error details:', error);

      // Fetch from local database if external API fails
      const localAttendances = await Attendance.find(filterQuery).skip(startIndex).limit(limit);
      console.log('Fetched attendances from local database:', localAttendances);

      // Fetch employee details for each local attendance
      const attendancesWithEmployeeDetails = await Promise.all(localAttendances.map(async (attendance) => {
        const employee = await Employe.findOne({ user_id: attendance.user_id }).populate('id_departement');
        if (employee) {
          console.log(`Found employee for user_id ${attendance.user_id}:`, employee);
        } else {
          console.log(`No employee found for user_id ${attendance.user_id}`);
        }
        return {
          ...attendance.toObject(),
          firstName: employee ? employee.prenom : '',
          lastName: employee ? employee.nom : '',
          loginMethod: employee ? employee.login_method : '',
          department: employee && employee.id_departement ? employee.id_departement.name : 'Il n\'appartient pas à un département',
          punchStatus: attendance.punch === 0 ? 'Missing' : 'Completed',
          activeStatus: attendance.status === 1 ? 'Active' : 'Inactive',
        };
      }));

      res.status(200).json(attendancesWithEmployeeDetails);
    }
  } catch (error) {
    // Handle errors
    console.error('Error fetching and syncing attendances:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Deletes all attendances both locally and on the external Flask API.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.deleteAllAttendances = async (req, res) => {
  try {
    try {
      // Delete all attendances on the device
      await axios.delete(`${BASE_FLASK_API_URL}/attendances`, {
        headers: { 'Device-ID': 'A8N5230560263' }
      });
    } catch (error) {
      console.warn('Failed to delete attendances on external API. Continuing with local delete.');
    }

    // Delete all attendances in the local database
    await Attendance.deleteMany({});

    // Respond with success message
    res.status(200).json({ message: 'All attendances have been deleted successfully both locally and on the device.' });
  } catch (error) {
    // Handle errors
    console.error('Error deleting all attendances:', error);
    res.status(error.response ? error.response.status : 500).json({ message: error.message });
  }
};
