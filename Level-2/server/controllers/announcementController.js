const Announcement = require('../models/Announcement');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const audienceByRole = {
  admin: ['all'],
  teacher: ['all', 'teachers'],
  student: ['all', 'students'],
  parent: ['all', 'parents']
};

const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({
    audience: { $in: audienceByRole[req.user.role] || ['all'] }
  })
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(20);

  sendSuccess(res, 200, 'Announcements fetched successfully', announcements);
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, audience = 'all' } = req.body;

  if (!title || !message) {
    res.status(400);
    throw new Error('Announcement title and message are required');
  }

  const announcement = await Announcement.create({
    title,
    message,
    audience,
    createdBy: req.user._id
  });

  sendSuccess(res, 201, 'Announcement sent successfully', announcement);
});

module.exports = {
  getAnnouncements,
  createAnnouncement
};
