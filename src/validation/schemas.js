const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const phone = Joi.string().pattern(/^\+[1-9]\d{7,14}$/).messages({
  'string.pattern.base': '{{#label}} must use E.164 format, for example +919876543210',
});
const password = Joi.string()
  .min(10)
  .max(72)
  .pattern(/[a-z]/, 'lowercase letter')
  .pattern(/[A-Z]/, 'uppercase letter')
  .pattern(/[0-9]/, 'number')
  .pattern(/[^A-Za-z0-9]/, 'special character');

const userFields = {
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  mobileNumber: phone.required(),
  password: password.required(),
};

const address = Joi.object({
  line1: Joi.string().trim().min(2).max(150).required(),
  line2: Joi.string().trim().allow('').max(150).default(''),
  city: Joi.string().trim().min(2).max(80).required(),
  state: Joi.string().trim().min(2).max(80).required(),
  postalCode: Joi.string().trim().min(3).max(20).required(),
  country: Joi.string().trim().min(2).max(80).required(),
});

const companyFields = {
  companyName: Joi.string().trim().min(2).max(120).required(),
  address: address.required(),
  contactNumber: phone.required(),
};

const schemas = {
  superAdminSignup: Joi.object(userFields),
  signin: Joi.object({
    mobileNumber: phone.required(),
    password: Joi.string().min(1).max(72).required(),
  }),
  companyCreate: Joi.object(companyFields),
  companySignup: Joi.object({
    company: Joi.object(companyFields).required(),
    admin: Joi.object(userFields).required(),
  }),
  companyUpdate: Joi.object({
    companyName: Joi.string().trim().min(2).max(120),
    address,
    contactNumber: phone,
    isActive: Joi.boolean(),
  }).min(1),
  productCreate: Joi.object({
    productName: Joi.string().trim().min(2).max(150).required(),
    description: Joi.string().trim().min(1).max(50_000).required(),
  }),
  productUpdate: Joi.object({
    productName: Joi.string().trim().min(2).max(150),
    description: Joi.string().trim().min(1).max(50_000),
  }).min(1),
  codeQuery: Joi.object({
    type: Joi.string().valid('qr', 'barcode').default('qr'),
  }),
  idParams: Joi.object({
    companyId: objectId,
    productId: objectId,
  }).or('companyId', 'productId'),
};

module.exports = schemas;
