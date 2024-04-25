const mongoose = require('mongoose');

const departementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employe' }]
});

module.exports = mongoose.model('Departement', departementSchema);
