const mongoose = require('mongoose');

const departementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employe' }]
});

module.exports = mongoose.model('Departement', departementSchema);
