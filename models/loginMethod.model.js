const mongoose = require('mongoose');

const loginMethodSchema = new mongoose.Schema({
  methodType: {
    type: String,
    enum: ['Card', 'Fingerprint', 'Password'],
    required: true
  },
  identifier: { // Card number or Password hash
    type: String,
    required: function() { return this.methodType !== 'Fingerprint'; },
    unique: true,
    sparse: true
  },
  fingerprintTemplate: { // Specific field for fingerprint data
    fid: Number,
    size: Number,
    template: String,
    uid: Number,
    valid: Boolean
  },
  inUse: {
    type: Boolean,
    default: false
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employe',
    default: null
  }
});

module.exports = mongoose.model('LoginMethod', loginMethodSchema);
