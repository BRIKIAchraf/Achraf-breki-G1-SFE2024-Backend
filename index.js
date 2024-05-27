require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config');
const { globalError, notFoundError } = require('./app/error');
const middlewares = require('./app/middleware');
const routes = require('./routes');

// Create express app and server
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// CORS setup
app.use(cors({
  origin: ['http://localhost:3000', 'https://front-endzktecotesting.vercel.app','https://front-endzktecotesting-6e8qvjvtp-achrafs-projects-cf98b892.vercel.app'], // Add your frontend domains
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

// Use custom middlewares
app.use(middlewares);

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
app.use(routes);

// Serve React app for any unknown routes
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handlers
app.use(notFoundError);
app.use(globalError);

// Connect to MongoDB and start the server
mongoose.connect(config.mongooseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to database!');
    server.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  })
  .catch((error) => {
    console.error('Connection failed!', error);
  });

module.exports = app;
