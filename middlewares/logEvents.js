const fs = require("fs");
const fsPromises = require("fs");
const path = require("path");
const { format } = require("date-fns");
const { v4: uuidv4 } = require("uuid");

// Add log file in project folder [log]
const logEvents = async (message, logFileName) => {
  const dateTime = `${format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}`;
  const log = `${dateTime}\t${uuidv4()}\t${message}\n`;

  try {
    // Create folder if it does not exist
    const logPath = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logPath)) {
      await fsPromises.mkdir(logPath);
    }

    // Append data to file
    const appendFile = path.join(logPath, logFileName);
    await fsPromises.appendFile(appendFile, log);
  } catch (err) {
    console.error('Error in logEvents:', err);
  }
};

//request Logger middleware
const requestLogger = (req, _res, next) => {
  // logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, "reqLog.txt");

  console.log(`${req.method} ${req.path}`);

  next();
};

module.exports = { logEvents, requestLogger };
