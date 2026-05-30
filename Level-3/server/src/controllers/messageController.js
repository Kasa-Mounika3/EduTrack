const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getMessages = asyncHandler(async (req, res) => {
  const otherUserId = req.query.user;

  if (!otherUserId) {
    res.status(400);
    throw new Error('Conversation user id is required');
  }

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: otherUserId },
      { sender: otherUserId, receiver: req.user._id }
    ]
  })
    .populate('sender', 'name email role')
    .populate('receiver', 'name email role')
    .sort({ createdAt: 1 })
    .limit(100);

  sendSuccess(res, 200, 'Messages fetched successfully', messages);
});

module.exports = { getMessages };
