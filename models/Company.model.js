const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  additionalInfo: { type: String },
  logo: { type: String }
});

module.exports = mongoose.model('Company', companySchema);
