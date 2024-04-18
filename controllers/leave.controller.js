const Leave = require('../models/leave.model');
const Employee = require('../models/employe.model');

/**
 * Assigns a leave to an employee.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.assignLeave = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, type } = req.body;
    const leave = new Leave({
      employee: employeeId,
      startDate,
      endDate,
      type,
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Revokes a leave assigned to an employee.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.revokeLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const leave = await Leave.findByIdAndRemove(leaveId);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    res.status(200).json({ message: 'Leave revoked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Modifies a leave by updating its details.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.modifyLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { startDate, endDate, status, type } = req.body;
    const leave = await Leave.findByIdAndUpdate(leaveId, { startDate, endDate, status, type }, { new: true });
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Lists all leaves along with the employee details.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.listLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate('employee');
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
