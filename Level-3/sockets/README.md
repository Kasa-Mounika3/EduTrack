# Socket.io Event Guide

This folder documents the real-time layer used by the EduTrack Task 2 EduTrack.

## Socket Authentication

The React client connects with a JWT:

```js
io(SOCKET_URL, {
  auth: {
    token: JWT_TOKEN
  }
});
```

The backend verifies the JWT before accepting the socket connection.

## Rooms

- `user:<userId>`: private user room
- `role:admin`: admin role room
- `role:student`: student role room
- `announcements`: global announcement room
- `custom:<roomName>`: client-requested custom rooms

## Events

Client to server:

```js
socket.emit('joinRoom', 'course:MERN101');
socket.emit('sendNotification', { title, message, role: 'student' });
socket.emit('sendMessage', { receiver: 'USER_OBJECT_ID', message });
```

Server to client:

```js
socket.on('receiveNotification', (notification) => {});
socket.on('receiveMessage', (message) => {});
socket.on('onlineUsers', (userIds) => {});
socket.on('dashboardUpdate', (payload) => {});
```

## Persistence

- Notifications are stored in MongoDB using `Notification`.
- Private messages are stored in MongoDB using `Message`.
- REST APIs load history so users do not lose data after refresh.
