require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
//const WebSocket = require("ws");
const http = require("http");
//const cron = require('node-cron');
const session = require('express-session');
const { auth } = require("express-openid-connect");
const bodyParser = require('body-parser');
// Configuring Auth0
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL
};

const app = express();
const server = http.createServer(app);
//const wss = new WebSocket.Server({ server });

// Middleware setup
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(auth(config)); // Auth0 middleware

// Route handlers
const employeRoutes = require('./routes/employe.route');
const planningRoutes = require('./routes/planning.route');
const attendanceRoutes = require('./routes/attendances.route');
const dashboardRoutes = require('./routes/dashboard.route');
const leaveRoutes = require('./routes/leave.route');
const fingerRoutes = require('./routes/finger.route');
const cardRoutes = require('./routes/card.route');
const departementRoutes = require('./routes/departement.route');
const loginMethodRoutes = require('./routes/loginMethod.route');
const searchRoutes = require('./routes/search.route');
const apiStatusRoutes = require('./routes/apiStatus.route');
app.use('/api/employes', employeRoutes);
app.use('/api/plannings', planningRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/fingers', fingerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/departements', departementRoutes);
app.use('/api/loginMethods', loginMethodRoutes);
app.use('/api', searchRoutes);
app.use('/api', apiStatusRoutes);
// Welcome route
app.get("/", (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

// WebSocket connection and messaging
/*wss.on('connection', function connection(ws) {
  console.log('WebSocket client connected');
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  ws.on('close', function close() {
    console.log('WebSocket client disconnected');
  });
  ws.send('Welcome to the WebSocket server!');
});*/

// MongoDB connection and server initialization
mongoose.connect("mongodb+srv://brikiachraf:Achraf_2021@cluster0.ixjgper.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("Connected to database!");
    server.listen(process.env.PORT || 3001, () => {
      console.log(`Server running on port ${process.env.PORT || 3001}`);
    });
  })
  .catch((error) => {
    console.error("Connection failed!", error);
  });

module.exports = app;
