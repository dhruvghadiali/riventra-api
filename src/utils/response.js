const moment = require('moment');

function serialize(document) {
  const value = typeof document.toObject === 'function' ? document.toObject() : { ...document };

  for (const field of ['createdAt', 'updatedAt', 'deletedAt']) {
    if (value[field]) {
      value[field] = moment(value[field]).utc().toISOString();
    }
  }

  delete value.password;
  return value;
}

module.exports = { serialize };
