const _ = require('lodash');
const QRCode = require('qrcode');
const bwipjs = require('bwip-js');
const sanitizeHtml = require('sanitize-html');
const Product = require('../models/product');
const { httpError } = require('../utils/http-error');
const { serialize } = require('../utils/response');

const richTextOptions = {
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote', 'a'],
  allowedAttributes: { a: ['href', 'title', 'target'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
};

function cleanDescription(value) {
  return sanitizeHtml(value, richTextOptions);
}

function hasVisibleDescription(value) {
  return Boolean(sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim());
}

async function addProduct(req, res) {
  const fields = _.pick(req.body, ['productName', 'description']);
  fields.description = cleanDescription(fields.description);
  if (!hasVisibleDescription(fields.description)) {
    throw httpError(422, 'Description must contain visible text', 'Validation Error');
  }

  const product = await Product.create({
    ...fields,
    company: req.user.company,
    createdBy: req.user._id,
  });
  res.status(201).json({ product: serialize(product) });
}

async function updateProduct(req, res) {
  const updates = _.pick(req.body, ['productName', 'description']);
  if (updates.description) {
    updates.description = cleanDescription(updates.description);
    if (!hasVisibleDescription(updates.description)) {
      throw httpError(422, 'Description must contain visible text', 'Validation Error');
    }
  }

  const product = await Product.findOneAndUpdate(
    { _id: req.params.productId, company: req.user.company, isActive: true },
    updates,
    { new: true, runValidators: true },
  );

  if (!product) throw httpError(404, 'Active product not found', 'Not Found');
  res.status(200).json({ product: serialize(product) });
}

function buildPrintCode(config) {
  return async function printCode(req, res) {
    const codeType = req.validated.query.type;
    const product = await Product.findOne({
      _id: req.params.productId,
      company: req.user.company,
      isActive: true,
    });
    if (!product) throw httpError(404, 'Active product not found', 'Not Found');

    let image;
    if (codeType === 'barcode') {
      image = await bwipjs.toBuffer({
        bcid: 'code128',
        text: product.scannerId,
        scale: 3,
        height: 12,
        includetext: true,
        textxalign: 'center',
      });
    } else {
      image = await QRCode.toBuffer(`${config.scannerBaseUrl}/${product.scannerId}`, {
        type: 'png',
        errorCorrectionLevel: 'H',
        width: 600,
        margin: 2,
      });
    }

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="${product.scannerId}-${codeType}.png"`,
      'Cache-Control': 'private, no-store',
    });
    res.status(200).send(image);
  };
}

async function deleteProduct(req, res) {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.productId, company: req.user.company, isActive: true },
    { isActive: false, deletedAt: new Date(), deletedBy: req.user._id },
    { new: true },
  );
  if (!product) throw httpError(404, 'Active product not found', 'Not Found');
  res.status(200).json({ product: serialize(product) });
}

async function restoreProduct(req, res) {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.productId, company: req.user.company, isActive: false },
    { isActive: true, deletedAt: null, deletedBy: null },
    { new: true },
  );
  if (!product) throw httpError(404, 'Deleted product not found', 'Not Found');
  res.status(200).json({ product: serialize(product) });
}

module.exports = { addProduct, updateProduct, buildPrintCode, deleteProduct, restoreProduct };
