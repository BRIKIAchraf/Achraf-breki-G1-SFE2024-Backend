const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jourSchema = new Schema({
  h_entree: { type: Date, required: true },
  h_sortie: { type: Date, required: true },
  id_planning: { type: Schema.Types.ObjectId, ref: 'Planning', required: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Jour', jourSchema);
