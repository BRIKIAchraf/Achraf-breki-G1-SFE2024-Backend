const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const employeSchema = new mongoose.Schema({
  user_id: { type: String, required: false, unique: true,  default: uuidv4 },
  nom: { type: String, required: false },
  prenom: { type: String, required: true },
  date_naissance: { type: Date, required: true },
  type: { type: String, required: true },
  id_planning: { type: mongoose.Schema.Types.ObjectId, ref: 'Planning', required: false },
  id_departement: { type: mongoose.Schema.Types.ObjectId, ref: 'Departement', required: false },
  login_method: {
    type: String,
    enum: ['PassOrFingerOrCard', 'Card', 'FingerAndPass'],
    required: false
  },
  externalId: { type: String, required: false, unique: true },
  picture: { type: String, required: false } // New field for picture URL
});

module.exports = mongoose.model('Employe', employeSchema);
