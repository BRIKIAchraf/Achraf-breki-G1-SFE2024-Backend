const Employe = require('../models/employe.model');
const Departement = require('../models/departement.model'); // Assuming you have a department model

/**
 * Retrieves dashboard statistics.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Fetch all employees to verify and fix the total count if necessary
    const employees = await Employe.find({});
    const totalEmployees = employees.length;

    // Count employees with specific login methods
    const totalWithCard = employees.filter(emp => emp.login_method === 'Card').length;
    const totalWithPassword = employees.filter(emp => emp.login_method === 'PassOrFingerOrCard').length;
    const totalWithFingerprints = employees.filter(emp => emp.login_method === 'FingerAndPass').length;

    // Count employees currently on leave
    const employeesOnLeave = employees.filter(emp => emp.isOnLeave).length;

    // Calculate average age of employees
    const ageSum = employees.reduce((sum, emp) => sum + (new Date() - new Date(emp.date_naissance)), 0);
    const averageAge = totalEmployees > 0 ? ageSum / totalEmployees / (365 * 24 * 60 * 60 * 1000) : 0; // Convert milliseconds to years

    // Fetch all departments
    const departments = await Departement.find({});
    const departmentMap = departments.reduce((map, dept) => {
      map[dept._id.toString()] = dept.name;
      return map;
    }, {});

    // Count employees by department
    const employeesByDepartment = await Employe.aggregate([
      { $group: { _id: '$id_departement', count: { $sum: 1 } } }
    ]);

    // Add department names to employeesByDepartment
    const employeesByDepartmentWithNames = employeesByDepartment.map(dept => ({
      ...dept,
      name: departmentMap[dept._id?.toString()] || 'Unknown'
    }));

    // Count employees on leave by department
    const leaveByDepartment = await Employe.aggregate([
      { $match: { isOnLeave: true } },
      { $group: { _id: '$id_departement', onLeaveCount: { $sum: 1 } } }
    ]);

    // Add department names to leaveByDepartment
    const leaveByDepartmentWithNames = leaveByDepartment.map(dept => ({
      ...dept,
      name: departmentMap[dept._id?.toString()] || 'Unknown'
    }));

    // Count the number of distinct departments
    const departmentCount = departments.length;

    // Send the dashboard statistics as JSON response
    res.status(200).json({
      totalEmployees,
      totalWithCard,
      totalWithPassword,
      totalWithFingerprints,
      averageAge,
      employeesOnLeave,
      departmentCount,
      employeesByDepartment: employeesByDepartmentWithNames,
      leaveByDepartment: leaveByDepartmentWithNames
    });
  } catch (error) {
    // Handle errors and send appropriate response
    res.status(500).json({ message: 'Error fetching dashboard stats: ' + error.message });
  }
};
