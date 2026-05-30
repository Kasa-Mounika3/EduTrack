# EduTrack

Smart Student Management System.

EduTrack is a production-style academic platform for school admins, teachers, parents, and students. It includes a polished React dashboard, student records, course management, notifications, messages, reports, secure sign in, and real-time updates.

## Run Locally

Server:

```bash
cd C:\Users\kasas\OneDrive\Desktop\SMS\Level-3\server
npm install
npm start
```

Client:

```bash
cd C:\Users\kasas\OneDrive\Desktop\SMS\Level-3\client
npm install
npm run dev
```

Local URLs:

```txt
App:    http://localhost:5173
Server: http://localhost:5000
```

## Product Features

- Modern EduTrack branding
- Responsive SaaS dashboard
- Light and dark mode
- Summary cards and academic insights
- Student search, course filter, pagination, add/edit modal, and confirmation dialogs
- Course cards with instructor information and progress indicators
- Notification dropdown with unread indicators
- Announcements and direct messages
- Profile and activity history
- Loading skeletons, empty states, hover states, and toast feedback

## Engineering Notes

The user interface avoids technical implementation wording. Under the hood, the existing server capabilities remain available for the application:

- REST routes
- GraphQL endpoint
- Socket.io updates
- JWT-secured requests
- MongoDB with Mongoose models

## Environment

Server `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/edutrack
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="EduTrack <no-reply@example.com>"
```

All three levels share the same MongoDB database name, `edutrack`. EduTrack reuses EduTrack student data and EduTrack academic/auth data, then adds announcements, notifications, activity logs, and analytics collections.

Client `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Deployment

Server:
- Deploy `Level-3/server` to Render.
- Build command: `npm install`
- Start command: `npm start`
- Add the server environment variables.

Client:
- Deploy `Level-3/client` to Vercel.
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_BASE_URL` to your deployed server URL ending in `/api`.
