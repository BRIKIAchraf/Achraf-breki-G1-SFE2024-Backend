const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const planningSchema = new Schema({
  intitule: { type: String, required: true },
  employees: [{
    type: Schema.Types.ObjectId,
    ref: 'Employe'
  }],
  isDeleted: { type: Boolean, default: false }, // Soft delete flag
}, { timestamps: true });

module.exports = mongoose.model('Planning', planningSchema);
