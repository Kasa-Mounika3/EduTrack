const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// dotenv reads backend/.env and adds values like PORT and MONGO_URI to process.env.
// It must run before this file reads process.env or starts the database connection.
const envPath = path.resolve(__dirname, '../.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.warn('Warning: .env file was not found in the backend folder.');
  console.warn('Create backend/.env or copy backend/.env.example to backend/.env.');
}

dotenv.config({ path: envPath });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const validateEnvironment = () => {
  // MONGO_URI is required because Mongoose needs it to know which MongoDB database to connect to.
  if (!process.env.MONGO_URI) {
    throw new Error(
      'MONGO_URI is missing. Add it to backend/.env, for example: MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.example.mongodb.net/edutrack'
    );
  }
};

const startServer = async () => {
  try {
    validateEnvironment();
    await connectDB();

    app.listen(PORT, () => {
      console.log(`EduTrack backend is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server.');
    console.error(error.message);
    console.error('Check that backend/.env exists, MONGO_URI is correct, and your MongoDB Atlas network access allows your IP address.');
    process.exit(1);
  }
};

startServer();
