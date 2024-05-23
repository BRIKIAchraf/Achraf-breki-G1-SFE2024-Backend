const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  id: String,
  name: { type: String, required: true },
  inet: { type: String, required: true },
  port: { type: Number, required: true },
  // Add other fields as necessary
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
