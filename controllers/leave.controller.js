const Leave = require('../models/leave.model');
const Employee = require('../models/employe.model');

/**
 * Assigns a leave to an existing employee.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.assignLeave = async (req, res) => {
  try {
    const { leaveName, startDate, endDate, selectedEmployees, type, status } = req.body;

    // Create a new leave
    const newLeave = new Leave({
      leaveName,
      startDate,
      endDate,
      type,
      status,
      employees: selectedEmployees // assuming multiple employee selection
    });

    await newLeave.save();
    res.status(201).json({ message: 'Leave assigned successfully', leave: newLeave });
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
    const leave = await Leave.findByIdAndDelete(leaveId);
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
 * Lists all leaves along with the employee details with pagination and filtering support.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.listLeaves = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (page - 1) * limit;
  const filters = {};

  // Apply status filter if provided
  if (status) {
    filters.status = status;
  }

  try {
    // Fetch leaves with pagination and filtering
    const leaves = await Leave.find(filters).skip(skip).limit(limit).populate('employees');
    const totalCount = await Leave.countDocuments(filters);

    res.status(200).json({ leaves, totalCount });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Error fetching leaves: ' + error.message });
  }
};

/**
 * Retrieves all employees for each leave.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.getEmployeesForLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate('employees');
    const employeesForLeaves = leaves.map(leave => ({
      leaveId: leave._id,
      employees: leave.employees,
    }));

    res.status(200).json(employeesForLeaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeaveById = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const leave = await Leave.findById(leaveId).populate('employees');
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    res.status(200).json({ leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
