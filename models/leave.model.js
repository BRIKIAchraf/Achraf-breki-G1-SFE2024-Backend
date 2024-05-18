const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  leaveName: String,
  employee: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employe'
  }],
  startDate: Date,
  endDate: Date,
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  type: String, // Type de congé, exemple: "annuel", "maladie", etc.
});

module.exports = mongoose.model('Leave', leaveSchema);
