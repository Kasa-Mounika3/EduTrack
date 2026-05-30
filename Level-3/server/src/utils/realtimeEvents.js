const Parent = require('../models/Parent');

const userRoom = (userId) => `user:${userId}`;

const emitStudentActivity = async (app, type, student) => {
  const io = app?.get('io');

  if (!io || !student) return;

  const payload = {
    type,
    student
  };

  io.to('announcements').emit('dashboardUpdate', payload);

  if (student.userAccount) {
    io.to(userRoom(student.userAccount._id || student.userAccount)).emit('studentActivity', payload);
  }

  const parents = await Parent.find({ children: student._id }).select('userAccount');

  parents.forEach((parent) => {
    if (parent.userAccount) {
      io.to(userRoom(parent.userAccount)).emit('studentActivity', payload);
    }
  });
};

module.exports = {
  emitStudentActivity
};
