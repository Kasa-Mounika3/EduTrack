const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const hasUnencodedAtInCredentials = (mongoUri) => {
  const authSection = mongoUri.split('://')[1]?.split('/')[0] || '';
  return (authSection.match(/@/g) || []).length > 1;
};

const validateMongoUri = (mongoUri) => {
  if (!mongoUri) {
    throw new Error('Missing MONGO_URI in .env');
  }

  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MONGO_URI. It must start with mongodb:// or mongodb+srv://');
  }

  if (hasUnencodedAtInCredentials(mongoUri)) {
    throw new Error('Invalid MONGO_URI. Your password appears to contain an unencoded @ character. Replace @ with %40 in the password.');
  }
};

const printAtlasHelp = (error) => {
  console.error('Checking Atlas Network Access...');
  console.error('Atlas troubleshooting:');
  console.error('- Confirm this backend has its own .env file in Level-2/server.');
  console.error('- Confirm MONGO_URI uses mongodb+srv:// for Atlas.');
  console.error('- Encode special password characters. Example: @ becomes %40.');
  console.error('- Add your current IP address in MongoDB Atlas > Network Access.');
  console.error('- Make sure the Atlas cluster is running and not paused.');
  console.error('- Check that the database username and password are correct.');

  if (/bad auth|authentication failed/i.test(error.message)) {
    console.error('- Atlas says authentication failed. Recheck the database user password, not your Atlas login password.');
  }

  if (/ENOTFOUND|querySrv/i.test(error.message)) {
    console.error('- DNS lookup failed. Recheck the cluster host name in the connection string.');
  }

  if (/server selection|Could not connect|timed out|not whitelisted|IP whitelist/i.test(error.message)) {
    console.error('- This often means your IP address is not allowed in Atlas Network Access.');
  }
};

const connectDB = async () => {
  validateMongoUri(process.env.MONGO_URI);

  mongoose.connection.on('error', (error) => {
    console.error(`MongoDB connection error: ${error.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  try {
    console.log('Connecting to MongoDB Atlas...');
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'edutrack',
      serverSelectionTimeoutMS: 10000
    });

    console.log(`MongoDB Connected Successfully: ${connection.connection.host}/${connection.connection.name}`);
  } catch (error) {
    printAtlasHelp(error);
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
