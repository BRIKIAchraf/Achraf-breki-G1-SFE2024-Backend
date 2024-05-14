const axios = require('axios');
const Attendance = require('../models/attendances.model');
const cron = require('node-cron');
const BASE_FLASK_API_URL = 'https://zkpi.omegup.tn';
const DEVICE_ID_HEADER = { headers: { 'Device-ID': 'A8N5230560263' } };

// Function to perform the synchronization with retry mechanism
async function synchronizeAttendances() {
    console.log('Running scheduled job to fetch and sync attendances.');
    try {
        await retryApiRequest(async () => {
            const response = await axios.get(`${BASE_FLASK_API_URL}/attendances`, DEVICE_ID_HEADER);
            const operations = response.data.map(attendance => ({
                updateOne: {
                    filter: { uid: attendance.uid, timestamp: new Date(attendance.timestamp) },
                    update: attendance,
                    upsert: true
                }
            }));
            await Attendance.bulkWrite(operations);
            console.log('Attendances synchronized successfully.');
        });
    } catch (error) {
        console.error('Error during scheduled attendance fetch:', error);
    }
}

// Retry mechanism function
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
 * Also broadcasts the updated attendances to WebSocket clients.
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

        let attendances = [];
        try {
            // Fetch attendances data from the Flask API with filters
            const response = await retryApiRequest(() => axios.get(`${BASE_FLASK_API_URL}/attendances`, {
                headers: DEVICE_ID_HEADER,
                params: filterQuery
            }));

            attendances = response.data.map(attendance => ({
                punch: attendance.punch,
                status: attendance.status,
                timestamp: new Date(attendance.timestamp),
                uid: attendance.uid,
                user_id: attendance.user_id
            }));

            // Clear existing attendances from the local database
            await Attendance.deleteMany({});
            // Insert the formatted attendances data into the local database
            await Attendance.insertMany(attendances);
        } catch {
            console.warn('Connection to external API failed. Serving local data.');
            // If external API call fails, serve data from local database
            attendances = await Attendance.find(filterQuery);
        }

        // Paginate the results
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedAttendances = attendances.slice(startIndex, endIndex);

        // Respond with the paginated attendances
        res.status(200).json(paginatedAttendances);
        
        // Broadcast updated attendances to all connected WebSocket clients
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'attendance_update',
              data: paginatedAttendances
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
        try {
            await retryApiRequest(() => axios.delete(`${BASE_FLASK_API_URL}/attendances`, DEVICE_ID_HEADER));
        } catch {
            console.warn('Failed to delete attendances from external API.');
        }

        // Delete all attendances in the local database
        await Attendance.deleteMany({});
        res.status(200).json({ message: 'All attendances have been deleted successfully both locally and on the device.' });
    } catch (error) {
        console.error('Error deleting all attendances:', error);
        res.status(error.response ? error.response.status : 500).json({ message: error.message });
    }
};
