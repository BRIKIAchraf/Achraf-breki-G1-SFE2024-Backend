const Employe = require('../models/employe.model');

/**
 * Retrieves dashboard statistics.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Count total employees
    const totalEmployees = await Employe.countDocuments();

    // Count employees with login method 'Card'
    const totalWithCard = await Employe.countDocuments({ login_method: 'Card' });

    // Count employees with login method 'PassOrFingerOrCard'
    const totalWithPassword = await Employe.countDocuments({ login_method: 'PassOrFingerOrCard' });

    // Count employees with login method 'FingerAndPass'
    const totalWithFingerprints = await Employe.countDocuments({ login_method: 'FingerAndPass' });

    // Calculate average age of employees
    const ageSum = (await Employe.aggregate([
      { $group: { _id: null, totalAge: { $sum: { $subtract: [new Date(), '$date_naissance'] } } } }
    ]))[0].totalAge;
    const averageAge = ageSum / totalEmployees / (365 * 24 * 60 * 60 * 1000); // Convert milliseconds to years

    // Send the dashboard statistics as JSON response
    res.status(200).json({
      totalEmployees,
      totalWithCard,
      totalWithPassword,
      totalWithFingerprints,
      averageAge
    });
  } catch (error) {
    // Handle errors and send appropriate response
    res.status(500).json({ message: 'Error fetching dashboard stats: ' + error.message });
  }
};
