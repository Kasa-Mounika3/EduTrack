const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    return next(new Error('Name, email, and password are required'));
  }

  if (!isValidEmail(email)) {
    res.status(400);
    return next(new Error('Please enter a valid email address'));
  }

  if (password.length < 6) {
    res.status(400);
    return next(new Error('Password must be at least 6 characters'));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error('Email and password are required'));
  }

  next();
};

const validateStudent = (req, res, next) => {
  const { studentName, name, email, course } = req.body;
  const isUpdate = req.method === 'PUT' || req.method === 'PATCH';

  if (!isUpdate && !studentName && !name) {
    res.status(400);
    return next(new Error('Student name is required'));
  }

  if (!isUpdate && !email) {
    res.status(400);
    return next(new Error('Student email is required'));
  }

  if (email && !isValidEmail(email)) {
    res.status(400);
    return next(new Error('Please enter a valid student email'));
  }

  next();
};

const validateCourse = (req, res, next) => {
  const { courseName, courseCode, instructor } = req.body;

  if (!courseName || !courseCode || !instructor) {
    res.status(400);
    return next(new Error('Course name, course code, and instructor are required'));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateStudent,
  validateCourse
};
