const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// dotenv loads Level-2/server/.env before any process.env value is used.
const envPath = path.resolve(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.warn('Warning: .env file was not found in Level-2/server.');
  console.warn('Create Level-2/server/.env or copy .env.example to .env.');
}
dotenv.config({ path: envPath });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const validateEnvironment = () => {
  if (!process.env.MONGO_URI) {
    throw new Error('Missing MONGO_URI in .env');
  }
};

const startServer = async () => {
  try {
    validateEnvironment();
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`EduTrack server is running on http://localhost:${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        console.error('Close the other Node server or change PORT in Level-2/server/.env.');
        process.exit(1);
      }

      throw error;
    });
  } catch (error) {
    console.error('Server startup failed.');
    console.error(error.message);
    console.error('Check .env, MONGO_URI, Atlas database user, and Atlas Network Access.');
    process.exit(1);
  }
};

startServer();
