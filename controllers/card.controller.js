const Card = require('../models/card.model');
const Employe = require('../models/employe.model');

/**
 * Creates a new card with the provided card number.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.createCard = async (req, res) => {
  try {
    const { cardNumber } = req.body;
    const card = new Card({ cardNumber });
    await card.save();
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: 'Error creating card: ' + error.message });
  }
};

/**
 * Assigns a card to an employee by linking their IDs.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.assignCardToEmployee = async (req, res) => {
  try {
    const { cardId, employeeId } = req.body;
    const card = await Card.findById(cardId);
    const employee = await Employe.findById(employeeId);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if the employee has an externalId
    if (!employee.externalId) {
      return res.status(400).json({ message: 'Employee externalId is required but not present.' });
    }

    // Update card and employee with their respective IDs
    card.employeeId = employeeId;
    await card.save();

    employee.card = cardId;
    await employee.save();

    res.status(200).json({
      message: 'Card assigned to employee successfully',
      employee: employee,
      card: card,
    });
  } catch (error) {
    console.error('Error assigning card:', error);
    res.status(500).json({ message: 'Error assigning card: ' + error.message });
  }
};

/**
 * Deletes a card by its ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    await Card.findByIdAndDelete(cardId);
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting card: ' + error.message });
  }
};
