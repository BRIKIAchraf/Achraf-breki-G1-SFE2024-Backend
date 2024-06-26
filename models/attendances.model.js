const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  punch: {
    type: Number,
    required: true
  },
  status: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  uid: {
    type: Number,
    required: true
  },
  user_id: {
    type: String, // Change from ObjectId to String
    required: true
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
