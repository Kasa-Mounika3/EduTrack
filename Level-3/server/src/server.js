const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// dotenv loads Level-3/server/.env before any process.env value is used.
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.warn('Warning: .env file was not found in Level-3/server.');
  console.warn('Create Level-3/server/.env or copy .env.example to .env.');
}
dotenv.config({ path: envPath });

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const setupApolloServer = require('./graphql/schema/apolloServer');
const setupSocketServer = require('./sockets/socketServer');

const PORT = process.env.PORT || 5000;

const validateEnvironment = () => {
  if (!process.env.MONGO_URI) {
    throw new Error('Missing MONGO_URI in .env');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET in .env');
  }
};

const startServer = async () => {
  try {
    validateEnvironment();
    await connectDB();
    await setupApolloServer(app);
    app.applyErrorMiddleware();

    const httpServer = http.createServer(app);
    setupSocketServer(httpServer, app);

    httpServer.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`GraphQL endpoint ready at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Startup failed.');
    console.error(error.message);
    console.error('Check .env, MONGO_URI, Atlas database user, and Atlas Network Access.');
    process.exit(1);
  }
};

startServer();
