const Notification = require('../models/Notification');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { sendAnnouncementEmail } = require('../utils/emailService');

const userRoom = (userId) => `user:${userId}`;
const roleRoom = (role) => `role:${role}`;

const getNotifications = asyncHandler(async (req, res) => {
  const query = {
    $or: [
      { receiver: req.user._id },
      { receiver: null, role: 'all' },
      { receiver: null, role: req.user.role }
    ]
  };

  const notifications = await Notification.find(query)
    .populate('sender', 'name email role')
    .populate('departmentId', 'departmentName departmentCode')
    .populate('sectionId', 'sectionName year')
    .sort({ createdAt: -1 })
    .limit(50);

  sendSuccess(res, 200, 'Notifications fetched successfully', notifications, {
    unread: notifications.filter((notification) => !notification.read).length
  });
});

const buildStudentFilter = ({ departmentId, year, sectionId }) => {
  const filter = {};
  if (departmentId) filter.departmentId = departmentId;
  if (year) filter.year = year;
  if (sectionId) filter.sectionId = sectionId;
  return filter;
};

const resolveRecipients = async ({ targetAudience, role, departmentId, year, sectionId }) => {
  if (targetAudience === 'teachers' || role === 'teacher') {
    const teachers = await Teacher.find().populate('userAccount', 'email');
    return teachers.map((teacher) => ({
      userId: teacher.userAccount?._id,
      email: teacher.email || teacher.userAccount?.email,
      role: 'teacher'
    }));
  }

  if (targetAudience === 'parents' || role === 'parent') {
    const parents = await Parent.find().populate('userAccount', 'email');
    return parents.map((parent) => ({
      userId: parent.userAccount?._id,
      email: parent.email || parent.userAccount?.email,
      role: 'parent'
    }));
  }

  const studentFilter = ['department', 'year', 'section'].includes(targetAudience)
    ? buildStudentFilter({ departmentId, year, sectionId })
    : {};

  const students = await Student.find(studentFilter).populate('userAccount', 'email');
  const studentRecipients = students.map((student) => ({
    userId: student.userAccount?._id,
    email: student.email || student.userAccount?.email,
    role: 'student'
  }));

  if (targetAudience === 'students' || role === 'student') {
    return studentRecipients;
  }

  const studentIds = students.map((student) => student._id);
  const parents = await Parent.find({
    $or: [
      { children: { $in: studentIds } },
      { linkedStudents: { $in: studentIds } }
    ]
  }).populate('userAccount', 'email');

  const parentRecipients = parents.map((parent) => ({
    userId: parent.userAccount?._id,
    email: parent.email || parent.userAccount?.email,
    role: 'parent'
  }));

  return [...studentRecipients, ...parentRecipients];
};

const emitAnnouncement = (req, notification, recipients, role) => {
  const io = req.app.get('io');
  if (!io) return;

  if (recipients.length > 0) {
    recipients.forEach((recipient) => {
      if (recipient.userId) {
        io.to(userRoom(recipient.userId)).emit('receiveNotification', notification);
      }
    });
    return;
  }

  if (role && role !== 'all') {
    io.to(roleRoom(role)).emit('receiveNotification', notification);
  } else {
    io.to('announcements').emit('receiveNotification', notification);
  }
};

const createNotification = asyncHandler(async (req, res) => {
  const targetAudience = req.body.targetAudience || 'all';
  const role = req.body.role || (
    targetAudience === 'students' ? 'student'
      : targetAudience === 'teachers' ? 'teacher'
        : targetAudience === 'parents' ? 'parent'
          : 'all'
  );

  const recipients = req.body.receiver
    ? [{ userId: req.body.receiver, email: null, role }]
    : await resolveRecipients({
      targetAudience,
      role,
      departmentId: req.body.departmentId,
      year: req.body.year,
      sectionId: req.body.sectionId
    });

  let emailDelivery;
  try {
    emailDelivery = await sendAnnouncementEmail({
      recipients: recipients.map((recipient) => recipient.email),
      subject: req.body.subject,
      title: req.body.title,
      message: req.body.message
    });
  } catch (error) {
    emailDelivery = { status: 'failed', sent: 0, reason: error.message };
  }

  const notificationPayload = {
    title: req.body.title,
    subject: req.body.subject || req.body.title,
    message: req.body.message,
    role,
    targetAudience,
    departmentId: req.body.departmentId || null,
    year: req.body.year || '',
    sectionId: req.body.sectionId || null,
    sender: req.user._id,
    emailDelivery
  };

  const isTargetedAudience = ['department', 'year', 'section'].includes(targetAudience);
  const recipientUsers = recipients.filter((recipient) => recipient.userId);
  
  let notifications;
  if (isTargetedAudience && !req.body.receiver) {
    if (recipientUsers.length === 0) {
      notifications = [await Notification.create({
        ...notificationPayload,
        receiver: null
      })];
    } else {
      notifications = await Notification.insertMany(
        recipientUsers.map((recipient) => ({
          ...notificationPayload,
          receiver: recipient.userId,
          role: recipient.role || 'all'
        }))
      );
    }
  } else {
    notifications = [await Notification.create({
      ...notificationPayload,
      receiver: req.body.receiver || null
    })];
  }

  const populated = await Notification.findById(notifications[0]._id).populate('sender', 'name email role');
  emitAnnouncement(req, populated, isTargetedAudience ? recipientUsers : req.body.receiver ? recipients : [], role);

  sendSuccess(res, 201, 'Announcement published successfully', populated, {
    saved: notifications.length,
    recipients: recipients.length,
    emailDelivery
  });
});

const markNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      $or: [{ receiver: req.user._id }, { receiver: null, role: req.user.role }, { receiver: null, role: 'all' }]
    },
    { read: true }
  );

  sendSuccess(res, 200, 'Notifications marked as read');
});

module.exports = {
  getNotifications,
  createNotification,
  markNotificationsRead
};
