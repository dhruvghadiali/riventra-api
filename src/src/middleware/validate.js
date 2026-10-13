const { httpError } = require('../utils/http-error');

function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      return next(httpError(422, message, 'Validation Error'));
    }

    req.validated = req.validated || {};
    req.validated[property] = value;
    if (property !== 'query') {
      req[property] = value;
    }
    return next();
  };
}

module.exports = { validate };
