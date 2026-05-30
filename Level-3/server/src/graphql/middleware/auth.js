const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Reads the same JWT used by REST APIs and attaches the matching user to GraphQL context.
const getUserFromRequest = async (req) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return User.findById(decoded.id).select('-password');
  } catch (error) {
    return null;
  }
};

module.exports = {
  getUserFromRequest
};
