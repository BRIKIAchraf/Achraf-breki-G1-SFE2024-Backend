const axios = require('axios');
const LoginMethod = require('../models/loginMethod.model');
const Employe = require('../models/employe.model');

const BASE_FLASK_API_URL = 'https://zkpi.omegup.tn';

// Add a new login method
exports.addLoginMethod = async (req, res) => {
  try {
    const { methodType, identifier, fingerprintTemplate } = req.body;
    let newLoginMethod;

    if (methodType === 'Fingerprint' && !fingerprintTemplate) {
      // Fetch the fingerprint template from the external API
      try {
        const response = await axios.get(`${BASE_FLASK_API_URL}/templates`, {
          headers: { 'Device-ID': 'A8N5230560263' }
        });
        if (response.data && response.data.template) {
          newLoginMethod = new LoginMethod({
            methodType,
            fingerprintTemplate: response.data.template
          });
        } else {
          return res.status(400).json({ message: 'No fingerprint template found from the external API.' });
        }
      } catch (error) {
        return res.status(500).json({ message: 'Error fetching fingerprint template: ' + error.message });
      }
    } else if (methodType === 'Fingerprint' && fingerprintTemplate) {
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

// List all login methods with pagination and filtering support
exports.listLoginMethods = async (req, res) => {
  const { page = 1, limit = 10, inUse } = req.query;
  const skip = (page - 1) * limit;
  const filters = { isDeleted: false }; // Only fetch non-deleted records

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

// Get allowed login methods
exports.getAllowedLoginMethods = async (req, res) => {
  try {
    const allowedMethods = ['Card', 'Fingerprint', 'Password'];
    res.status(200).json(allowedMethods);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving login methods: ' + error.message });
  }
};

// Delete a login method (soft delete)
exports.deleteLoginMethod = async (req, res) => {
  const { id } = req.params;
  try {
    const loginMethod = await LoginMethod.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!loginMethod) {
      return res.status(404).json({ message: 'Login method not found' });
    }
    res.status(200).json({ message: 'Login method deleted successfully', loginMethod });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting login method: ' + error.message });
  }
};

// Modify a login method
exports.modifyLoginMethod = async (req, res) => {
  const { id } = req.params;
  const { methodType, identifier, fingerprintTemplate } = req.body;
  try {
    const loginMethod = await LoginMethod.findById(id);
    if (!loginMethod) {
      return res.status(404).json({ message: 'Login method not found' });
    }

    if (methodType) loginMethod.methodType = methodType;
    if (identifier) loginMethod.identifier = identifier;
    if (fingerprintTemplate) loginMethod.fingerprintTemplate = fingerprintTemplate;

    await loginMethod.save();
    res.status(200).json(loginMethod);
  } catch (error) {
    res.status(500).json({ message: 'Error modifying login method: ' + error.message });
  }
};

// Unassign a login method from an employee
exports.unassignLoginMethod = async (req, res) => {
  const { loginMethodId } = req.body;
  try {
    const loginMethod = await LoginMethod.findById(loginMethodId);
    if (!loginMethod) {
      return res.status(404).json({ message: 'Login method not found' });
    }

    loginMethod.assignedTo = null;
    loginMethod.inUse = false;
    await loginMethod.save();
    res.status(200).json(loginMethod);
  } catch (error) {
    res.status(500).json({ message: 'Error unassigning login method: ' + error.message });
  }
};
