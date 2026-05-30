const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

const userRoom = (userId) => `user:${userId}`;
const roleRoom = (role) => `role:${role}`;

const setupSocketServer = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  const onlineUsers = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Socket authentication token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Socket user not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    const role = socket.user.role;
    const existingSockets = onlineUsers.get(userId) || new Set();

    existingSockets.add(socket.id);
    onlineUsers.set(userId, existingSockets);

    socket.join(userRoom(userId));
    socket.join(roleRoom(role));
    socket.join('announcements');

    io.emit('onlineUsers', Array.from(onlineUsers.keys()));

    socket.on('joinRoom', (roomName) => {
      // Keep custom rooms namespaced so clients cannot join arbitrary Socket.io internals.
      socket.join(`custom:${roomName}`);
    });

    socket.on('sendNotification', async (payload, ack) => {
      try {
        const notification = await Notification.create({
          title: payload.title,
          message: payload.message,
          sender: userId,
          receiver: payload.receiver || null,
          role: payload.role || 'all'
        });

        const populated = await notification.populate('sender', 'name email role');

        if (payload.receiver) {
          io.to(userRoom(payload.receiver)).emit('receiveNotification', populated);
        } else if (payload.role && payload.role !== 'all') {
          io.to(roleRoom(payload.role)).emit('receiveNotification', populated);
        } else {
          io.to('announcements').emit('receiveNotification', populated);
        }

        ack?.({ success: true, data: populated });
      } catch (error) {
        ack?.({ success: false, message: error.message });
      }
    });

    socket.on('sendMessage', async (payload, ack) => {
      try {
        const savedMessage = await Message.create({
          sender: userId,
          receiver: payload.receiver,
          message: payload.message
        });

        const populated = await savedMessage.populate([
          { path: 'sender', select: 'name email role' },
          { path: 'receiver', select: 'name email role' }
        ]);

        io.to(userRoom(payload.receiver)).emit('receiveMessage', populated);
        io.to(userRoom(userId)).emit('receiveMessage', populated);

        ack?.({ success: true, data: populated });
      } catch (error) {
        ack?.({ success: false, message: error.message });
      }
    });

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);

      if (sockets) {
        sockets.delete(socket.id);

        if (sockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }

      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });

  app.set('io', io);
  app.set('onlineUsers', onlineUsers);

  return io;
};

module.exports = setupSocketServer;
