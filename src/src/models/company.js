const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true, trim: true, maxlength: 150 },
  line2: { type: String, trim: true, maxlength: 150, default: '' },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  state: { type: String, required: true, trim: true, maxlength: 80 },
  postalCode: { type: String, required: true, trim: true, maxlength: 20 },
  country: { type: String, required: true, trim: true, maxlength: 80 },
}, { _id: false });

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  address: { type: addressSchema, required: true },
  contactNumber: { type: String, required: true, trim: true, match: /^\+[1-9]\d{7,14}$/ },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  isActive: { type: Boolean, default: true, index: true },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  versionKey: false,
});

companySchema.index({ companyName: 1 });

module.exports = mongoose.model('Company', companySchema);
