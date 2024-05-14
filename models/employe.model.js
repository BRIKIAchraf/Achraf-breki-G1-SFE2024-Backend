const mongoose = require('mongoose');

const employeSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  date_naissance: { type: Date, required: true },
  type: { type: String, required: true },
  id_planning: { type: mongoose.Schema.Types.ObjectId, ref: 'Planning', required: false},
  id_departement: { type: mongoose.Schema.Types.ObjectId, ref: 'Departement', required: false},
  login_method: {
    type: String,
    enum: ['PassOrFingerOrCard', 'Card', 'FingerAndPass'],
    required: false
  },
  externalId: { type: String, required: false, unique: true }
});

module.exports = mongoose.model('Employe', employeSchema);
