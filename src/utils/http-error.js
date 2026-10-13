function httpError(status, message, name = 'Request Error') {
  const error = new Error(message);
  error.status = status;
  error.name = name;
  return error;
}

module.exports = { httpError };
