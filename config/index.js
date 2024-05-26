const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT || 3001,
  mongooseUrl:
    process.env.MONGO_URL || "",
  jwtSecret: {
    access: process.env.ACCESS_TOKEN_SECRET,
    refresh: process.env.REFRESH_TOKEN_SECRET,
  },
};
