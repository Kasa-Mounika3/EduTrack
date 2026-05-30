const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Allows the future React frontend to call this API from a browser.
app.use(cors());

// Parses incoming JSON request bodies, such as POST and PUT student data.
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EduTrack API is running'
  });
});

app.use('/api/students', studentRoutes);

// These must stay after all routes so unmatched requests and thrown errors are handled.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
