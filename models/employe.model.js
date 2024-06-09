// employe.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');

const employeSchema = new Schema({
  user_id: { type: String, unique: true, default: uuidv4 },
  nom: { type: String, required: false },
  prenom: { type: String, required: true },
  date_naissance: { type: Date, required: true },
  type: { type: String, required: true },
  id_planning: { type: Schema.Types.ObjectId, ref: 'Planning', required: false },
  id_departement: { type: Schema.Types.ObjectId, ref: 'Departement', required: false },
  login_method: {
    type: String,
    enum: ['PassOrFingerOrCard', 'Card', 'FingerAndPass'],
    required: false
  },
  externalId: { type: String, unique: true, required: false },
  picture: { type: String, required: false },
  previousPlannings: [{ type: Schema.Types.ObjectId, ref: 'Planning' }],
  previousLeaves: [{ type: Schema.Types.ObjectId, ref: 'Leave' }],
  previousLoginMethods: [{ type: Schema.Types.ObjectId, ref: 'LoginMethod' }]
});

module.exports = mongoose.model('Employe', employeSchema);
