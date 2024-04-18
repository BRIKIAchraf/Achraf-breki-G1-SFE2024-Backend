const axios = require('axios');
const Attendance = require('../models/attendances.model');
const BASE_FLASK_API_URL = 'http://localhost:5000';
const wss = require('../index').wss;

/**
 * Fetches attendances data from the external Flask API, syncs it with the local database,
 * and responds with the updated attendances.
 * Also broadcasts the updated attendances to WebSocket clients.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.getAttendances = async (req, res) => {
    try {
        // Fetch attendances data from the Flask API
        const response = await axios.get(`${BASE_FLASK_API_URL}/attendances`, {
            headers: { 'Device-ID': 'A8N5230560263' }
        });

        // Clear existing attendances from the local database
        await Attendance.deleteMany({});

        // Map and format the fetched attendances data
        const attendances = response.data.map(attendance => ({
            punch: attendance.punch,
            status: attendance.status,
            timestamp: new Date(attendance.timestamp),
            uid: attendance.uid,
            user_id: attendance.user_id
        }));

        // Insert the formatted attendances data into the local database
        await Attendance.insertMany(attendances);

        // Respond with the updated attendances
        res.status(200).json(attendances);
        
        // Broadcast updated attendances to all connected WebSocket clients
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'attendance_update',
              data: attendances
            }));
          }
        });
    } catch (error) {
        // Handle errors
        console.error('Error fetching and syncing attendances:', error);
        res.status(error.response ? error.response.status : 500).json({ message: error.message });
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
        // Delete all attendances on the device
        await axios.delete(`${BASE_FLASK_API_URL}/attendances`, {
            headers: { 'Device-ID': 'A8N5230560263' }
        });

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

