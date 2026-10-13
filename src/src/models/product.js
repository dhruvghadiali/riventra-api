const crypto = require('crypto');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
  description: { type: String, required: true, maxlength: 50_000 },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  isActive: { type: Boolean, default: true, index: true },
  scannerId: { type: String, default: () => crypto.randomUUID(), unique: true, immutable: true },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  versionKey: false,
});

productSchema.index({ company: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
