const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function sanitizeValue(value) {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(sanitizeValue);
    return;
  }

  for (const key of Object.keys(value)) {
    if (BLOCKED_KEYS.has(key)) {
      delete value[key];
      continue;
    }

    const sanitizedKey = key.replaceAll('$', '_').replaceAll('.', '_');

    if (sanitizedKey !== key) {
      value[sanitizedKey] = value[key];
      delete value[key];
    }

    sanitizeValue(value[sanitizedKey]);
  }
}

function sanitizeRequest(req, res, next) {
  sanitizeValue(req.body);
  sanitizeValue(req.params);
  sanitizeValue(req.query);
  next();
}

module.exports = { sanitizeRequest };
