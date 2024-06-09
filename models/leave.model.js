const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  leaveName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { type: String, required: true },
  status: { type: String, required: true },
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  isDeleted: { type: Boolean, default: false }, // Soft delete flag
}, { timestamps: true });

const Leave = mongoose.model('Leave', LeaveSchema);

module.exports = Leave;
