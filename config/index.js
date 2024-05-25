const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT || 3001,
  mongooseUrl:
    process.env.MONGO_URL || "mongodb+srv://brikiachraf:Achraf_2021@cluster0.ixjgper.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  jwtSecret: {
    access: process.env.ACCESS_TOKEN_SECRET,
    refresh: process.env.REFRESH_TOKEN_SECRET,
  },
};
