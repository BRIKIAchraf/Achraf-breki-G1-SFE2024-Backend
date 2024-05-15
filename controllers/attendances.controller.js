const axios = require('axios');
const Attendance = require('../models/attendances.model');
const Employe = require('../models/employe.model');
const BASE_FLASK_API_URL = 'https://zkpi.omegup.tn';
const DEVICE_ID_HEADER = { headers: { 'Device-ID': 'A8N5230560263' } };

// Function to perform the synchronization
async function synchronizeAttendances() {
  console.log('Running scheduled job to fetch and sync attendances.');
  try {
    const response = await axios.get(`${BASE_FLASK_API_URL}/attendances`, {
      headers: { 'Device-ID': 'A8N5230560263' }
    });
    const operations = response.data.map(attendance => ({
      updateOne: {
        filter: { uid: attendance.uid, timestamp: new Date(attendance.timestamp) },
        update: attendance,
        upsert: true
      }
    }));
    await Attendance.bulkWrite(operations);
    console.log('Attendances synchronized successfully.');
  } catch (error) {
    console.error('Error during scheduled attendance fetch:', error);
  }
}

// Scheduled task to fetch and synchronize attendance data every 5 seconds
setInterval(synchronizeAttendances, 5000);

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
      const response = await axios.get(`${BASE_FLASK_API_URL}/attendances`, {
        headers: { 'Device-ID': 'A8N5230560263' },
        params: filterQuery
      });

      // Map and format the fetched attendances data
      const attendances = response.data.map(attendance => ({
        punch: attendance.punch,
        status: attendance.status,
        timestamp: new Date(attendance.timestamp),
        uid: attendance.uid,
        user_id: attendance.user_id
      }));

      // Insert the formatted attendances data into the local database
      await Attendance.deleteMany({});
      await Attendance.insertMany(attendances);

      // Paginate the results
      const paginatedAttendances = attendances.slice(startIndex, endIndex);

      // Fetch employee details for each attendance
      const attendancesWithEmployeeDetails = await Promise.all(paginatedAttendances.map(async (attendance) => {
        const employee = await Employe.findOne({ user_id: attendance.user_id }).populate('id_departement');
        return {
          ...attendance,
          first_name: employee ? employee.prenom : '',
          last_name: employee ? employee.nom : '',
          login_method: employee ? employee.login_method : '',
          department: employee && employee.id_departement ? employee.id_departement.name : 'Il n\'appartient pas à un département'
        };
      }));

      // Respond with the paginated attendances with employee details
      res.status(200).json(attendancesWithEmployeeDetails);

    } catch (error) {
      console.warn('Connection to external API failed. Serving local data.');

      // Fetch from local database if external API fails
      const localAttendances = await Attendance.find(filterQuery).skip(startIndex).limit(limit);

      // Fetch employee details for each local attendance
      const attendancesWithEmployeeDetails = await Promise.all(localAttendances.map(async (attendance) => {
        const employee = await Employe.findOne({ user_id: attendance.user_id }).populate('id_departement');
        return {
          ...attendance.toObject(),
          first_name: employee ? employee.prenom : '',
          last_name: employee ? employee.nom : '',
          login_method: employee ? employee.login_method : '',
          department: employee && employee.id_departement ? employee.id_departement.name : 'Il n\'appartient pas à un département'
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
