const axios = require('axios');
const Device = require('../models/device.model');

exports.syncDevices = async (req, res) => {
  try {
    const response = await axios.get('https://zkpi.omegup.tn/devices');
    const devices = response.data;

    // Save devices to MongoDB
    await Device.insertMany(devices);

    res.json({ success: true, message: 'Devices synchronized' });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
};

exports.listDevices = async (req, res) => {
  try {
    const devices = await Device.find({});
    res.json(devices);
  } catch (error) {
    console.error('Error listing devices:', error);
    res.status(500).json({ error: 'Failed to list devices' });
  }
};

exports.removeDevice = async (req, res) => {
  const { id } = req.params;
  try {
    const device = await Device.findById(id);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    await device.remove();

    try {
      await axios.delete(`https://zkpi.omegup.tn/device/${id}`);
      res.json({ success: true, message: 'Device removed and deletion request sent to Flask API' });
    } catch (flaskError) {
      console.error('Error removing device from Flask API:', flaskError);
      res.status(500).json({ error: 'Device removed from MongoDB, but failed to delete from Flask API' });
    }

  } catch (error) {
    console.error('Error removing device:', error);
    res.status(500).json({ error: 'Failed to remove device' });
  }
};

exports.scanByPort = async (req, res) => {
  const { port } = req.body;
  try {
    const response = await axios.post(`https://zkpi.omegup.tn/devices/scan?port=${port}`);
    const deviceData = response.data;

    const newDevice = new Device(deviceData);
    await newDevice.save();

    res.json({ success: true, message: 'Device scanned by port and saved', device: newDevice });
  } catch (error) {
    console.error('Error scanning device by port:', error);
    res.status(500).json({ error: 'Failed to scan device by port' });
  }
};

exports.scanByInet = async (req, res) => {
  const { inet } = req.body;
  try {
    const response = await axios.post(`https://zkpi.omegup.tn/devices/scan?inet=${inet}`);
    const deviceData = response.data;

    const newDevice = new Device(deviceData);
    await newDevice.save();

    res.json({ success: true, message: 'Device scanned by inet and saved', device: newDevice });
  } catch (error) {
    console.error('Error scanning device by inet:', error);
    res.status(500).json({ error: 'Failed to scan device by inet' });
  }
};

exports.pingDevice = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.post(`https://zkpi.omegup.tn/device/${id}/ping`);
    const pingResult = response.data;

    res.json({ success: true, message: 'Device pinged successfully', result: pingResult });
  } catch (error) {
    console.error('Error pinging device:', error);
    res.status(500).json({ error: 'Failed to ping device' });
  }
};

exports.updateDevice = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const response = await axios.patch(`https://zkpi.omegup.tn/device/${id}`, { name });
    const updatedDevice = response.data;

    const device = await Device.findByIdAndUpdate(id, { name: updatedDevice.name }, { new: true });

    res.json({ success: true, message: 'Device updated successfully', device });
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
};
