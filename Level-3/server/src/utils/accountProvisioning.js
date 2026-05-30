const User = require('../models/User');

const makeStarterPassword = (email) => {
  const prefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'user';
  return `${prefix}@123`;
};

const createRoleAccount = async ({ name, email, role, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    console.log(`[EduTrack] Reusing existing ${role} user account: ${email}`);
    return {
      user: existingUser,
      temporaryPassword: null,
      reused: true
    };
  }

  const temporaryPassword = password || makeStarterPassword(email);
  const user = await User.create({
    name,
    email,
    password: temporaryPassword,
    role
  });
  console.log(`[EduTrack] User created for ${role}: ${email}`);

  return {
    user,
    temporaryPassword,
    reused: false
  };
};

module.exports = {
  createRoleAccount
};
