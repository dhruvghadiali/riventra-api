const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Company = require('../models/company');
const { asyncHandler } = require('../utils/async-handler');
const { httpError } = require('../utils/http-error');

function authenticate(config) {
  return asyncHandler(async (req, res, next) => {
    const [scheme, token] = (req.get('authorization') || '').split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw httpError(401, 'A Bearer token is required', 'Unauthorized');
    }

    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    } catch {
      throw httpError(401, 'The access token is invalid or expired', 'Unauthorized');
    }

    const user = await User.findOne({ _id: payload.sub, isActive: true });
    if (!user || user.role !== payload.role) {
      throw httpError(401, 'The account is unavailable', 'Unauthorized');
    }

    if (user.role === 'company_admin') {
      const company = await Company.findOne({ _id: user.company, isActive: true });
      if (!company) {
        throw httpError(403, 'The company is inactive', 'Forbidden');
      }
    }

    req.user = user;
    next();
  });
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(httpError(403, 'You do not have permission for this action', 'Forbidden'));
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
