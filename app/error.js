const { Error: MongooseError } = require("mongoose");
const { logEvents } = require("../middlewares/logEvents");
const notFoundError = (_req, _res, next) => {
  const error = new Error('Resource not found!');
  error.status = 404;
  next(error);
};

const globalError = async (error, _req, res, _next) => {
  await logEvents(`${error.name}: ${error.message}`, 'errorLogs.txt');

  if (error.status) {
    return res.status(error.status).json({ message: error.message });
  }

  if (error.message.includes('secretOrPrivateKey must have a value')) {
    return res.status(500).json({ message: 'Internal server error: Secret or private key not set' });
  }

  res.status(500).json({ message: `(Internal server error): ${error.message}` });
};

module.exports = { notFoundError, globalError };
