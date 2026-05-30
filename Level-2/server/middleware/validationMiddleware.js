const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const validateStudentInput = (req, res, next) => {
  const { studentName, name, email } = req.body;
  const isUpdate = req.method === 'PUT' || req.method === 'PATCH';

  if (!isUpdate && !studentName && !name) {
    res.status(400);
    return next(new Error('Student name is required'));
  }

  if (!isUpdate && !email) {
    res.status(400);
    return next(new Error('A valid student email is required'));
  }

  if (email && !isValidEmail(email)) {
    res.status(400);
    return next(new Error('A valid student email is required'));
  }

  next();
};

const validateCourseInput = (req, res, next) => {
  const { courseName, courseCode, instructor } = req.body;

  if (!courseName || !courseCode || !instructor) {
    res.status(400);
    return next(new Error('Course name, course code, and instructor are required'));
  }

  next();
};

module.exports = {
  validateStudentInput,
  validateCourseInput
};
