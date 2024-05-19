const LoginMethod = require('../models/loginMethod.model');
const Employe = require('../models/employe.model');

// Add a new login method
exports.addLoginMethod = async (req, res) => {
  try {
    const { methodType, identifier, fingerprintTemplate } = req.body;
    let newLoginMethod;
    if (methodType === 'Fingerprint' && fingerprintTemplate) {
      newLoginMethod = new LoginMethod({
        methodType,
        fingerprintTemplate
      });
    } else {
      newLoginMethod = new LoginMethod({
        methodType,
        identifier
      });
    }
    await newLoginMethod.save();
    res.status(201).json(newLoginMethod);
  } catch (error) {
    res.status(500).json({ message: 'Error adding login method: ' + error.message });
  }
};

// Assign a login method to an employee
exports.assignLoginMethod = async (req, res) => {
  const { loginMethodId, employeeId } = req.body;
  try {
    const loginMethod = await LoginMethod.findById(loginMethodId);
    if (!loginMethod) {
      return res.status(404).json({ message: 'Login method not found' });
    }
    if (loginMethod.inUse) {
      return res.status(400).json({ message: 'Login method is already in use' });
    }

    const employee = await Employe.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    loginMethod.assignedTo = employeeId;
    loginMethod.inUse = true;
    await loginMethod.save();
    res.status(200).json(loginMethod);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning login method: ' + error.message });
  }
};

/**
 * Lists all login methods with pagination and filtering support.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.listLoginMethods = async (req, res) => {
  const { page = 1, limit = 10, inUse } = req.query;
  const skip = (page - 1) * limit;
  const filters = {};

  // Apply filter for inUse status if provided
  if (inUse !== undefined) {
    filters.inUse = inUse;
  }

  try {
    // Fetch login methods with pagination and filtering
    const loginMethods = await LoginMethod.find(filters).skip(skip).limit(limit).populate('assignedTo', 'nom prenom id_departement');
    const totalCount = await LoginMethod.countDocuments(filters);

    res.status(200).json({ loginMethods, totalCount });
  } catch (error) {
    console.error('Error retrieving login methods:', error);
    res.status(500).json({ message: 'Error retrieving login methods: ' + error.message });
  }
};

exports.getAllowedLoginMethods = async (req, res) => {
  try {
    const allowedMethods = ['Card', 'Fingerprint', 'Password'];
    res.status(200).json(allowedMethods);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving login methods: ' + error.message });
  }
};


// Additional functions for handling fingerprint validation and unassignment can be added as needed.
