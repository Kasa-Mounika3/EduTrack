# EduTrack

Smart Student Management System.

EduTrack provides a multi-role academic management system with React, JWT authentication, role-based authorization, MongoDB relationships, academic progress tracking, and role-specific dashboards.

## Structure

```txt
Level-2/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- services/
|   |   `-- styles/
|   |-- .env.example
|   `-- package.json
|-- server/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- utils/
|   |-- app.js
|   |-- server.js
|   |-- .env.example
|   `-- package.json
`-- README.md
```

## Features

- React.js frontend with functional components
- React Router DOM routing
- Axios API client
- Context API for auth, students, and courses
- Register and login
- JWT authentication
- bcrypt password hashing
- Protected routes
- Admin, teacher, student, and parent roles
- MongoDB/Mongoose relationships
- Automatic student/teacher/parent login account creation by admin
- Attendance, marks, course progress, announcements, and parent monitoring
- Validation, indexing, search filtering, and pagination
- Responsive dashboard UI

## Roles

Admin:
- Add students, teachers, and parents
- Create courses
- Assign teachers and parents to students
- Manage academic records
- Send announcements

Teacher:
- View assigned students
- Update attendance
- Update grades and course progress
- Send announcements

Student:
- Login securely
- View attendance, marks, grade, course progress, courses, notifications, and profile

Parent:
- Login securely
- View child attendance, grades, course progress, and announcements

## Run Backend

```bash
cd Level-2/server
copy .env.example .env
npm install
npm run dev
```

## Run Frontend

```bash
cd Level-2/client
copy .env.example .env
npm install
npm run dev
```

## URLs

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

## Server Environment Variables

```env
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/edutrack
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

EduTrack connects to the same `edutrack` database as EduTrack and extends those collections with authentication and academic structure.

## Client Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## API Testing Guide

1. Register an admin user.
2. Login and copy the JWT token.
3. Create courses.
4. Create students using course ObjectIds. The backend automatically creates student login credentials.
5. Create teachers and assign students.
6. Create parents and connect them to child students.
7. Login as teacher, update attendance and grades.
8. Login as student or parent and verify dashboard access is role-limited.

## Main API Routes

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile

GET  /api/dashboard

GET  /api/students
POST /api/students
GET  /api/students/:id
PUT  /api/students/:id
PATCH /api/students/:id/attendance
PATCH /api/students/:id/grades
DELETE /api/students/:id

GET  /api/teachers
POST /api/teachers

GET  /api/parents
POST /api/parents

GET  /api/courses
POST /api/courses

GET  /api/announcements
POST /api/announcements
```

## Deployment Guide

Backend:
- Deploy `Level-2/server` to Render.
- Build command: `npm install`
- Start command: `npm start`
- Add server environment variables.

Frontend:
- Deploy `Level-2/client` to Vercel.
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_BASE_URL=https://YOUR_RENDER_URL/api`.
