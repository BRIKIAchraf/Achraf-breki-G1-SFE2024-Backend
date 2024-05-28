const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeviceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  mac: { type: String, required: true, unique: true },
  inet: { type: String, required: true },
  lastCheckedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
  name: { type: String }
});

module.exports = mongoose.model('Device', DeviceSchema);
