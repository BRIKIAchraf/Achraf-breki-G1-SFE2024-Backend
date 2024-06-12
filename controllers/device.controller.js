const axios = require('axios');
const Device = require('../models/device.model');

const FLASK_API_URL = 'http://localhost:3000/';

exports.scanDevice = async (req, res) => {
  try {
    const { port, inet } = req.body;

    let response;
    if (port) {
      response = await axios.post(`${FLASK_API_URL}/devices/scan?port=${port}`);
    } else if (inet) {
      response = await axios.post(`${FLASK_API_URL}/devices/scan?inet=${inet}`);
    } else {
      return res.status(400).send({ message: 'Invalid parameters' });
    }

    const deviceData = response.data;

    const device = new Device(deviceData);
    await device.save();

    res.status(201).send(deviceData);
  } catch (error) {
    res.status(500).send({ message: 'An error occurred while scanning the device', error });
  }
};

exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.find();
    res.send(devices);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.pingDevice = async (req, res) => {
  const { device_id } = req.params;

  try {
    const device = await Device.findById(device_id);
    if (!device) {
      return res.status(404).send({ message: 'Device not found' });
    }

    const response = await axios.post(`${FLASK_API_URL}/device/${device_id}/ping`);
    res.json(response.data);
  } catch (error) {
    res.status(500).send({ message: 'An error occurred while pinging the device', error });
  }
};

exports.removeDevice = async (req, res) => {
  const { device_id } = req.params;

  try {
    await Device.findByIdAndDelete(device_id);
    res.status(200).send({ message: 'Device removed successfully' });
  } catch (error) {
    res.status(500).send({ message: 'An error occurred while removing the device', error });
  }
};

exports.updateDevice = async (req, res) => {
  const { device_id } = req.params;
  const { name } = req.body;

  try {
    const device = await Device.findById(device_id);
    if (!device) {
      return res.status(404).send({ message: 'Device not found' });
    }

    if (name) {
      device.name = name;
    }

    await device.save();

    res.status(200).send({ message: 'Device updated successfully', device });
  } catch (error) {
    res.status(500).send({ message: 'An error occurred while updating the device', error });
  }
};
