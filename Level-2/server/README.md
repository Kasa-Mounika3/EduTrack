# EduTrack MERN Database Server

Production-style Express, MongoDB, JWT, and role-based API for EduTrack EduTrack.

## Folder Structure

```txt
server/
|-- app.js
|-- server.js
|-- package.json
|-- .env.example
|-- config/
|   `-- db.js
|-- controllers/
|   |-- authController.js
|   |-- courseController.js
|   `-- studentController.js
|-- middleware/
|   |-- authMiddleware.js
|   |-- errorMiddleware.js
|   |-- roleMiddleware.js
|   `-- validationMiddleware.js
|-- models/
|   |-- Course.js
|   |-- Parent.js
|   |-- Student.js
|   |-- Teacher.js
|   `-- User.js
|-- routes/
|   |-- authRoutes.js
|   |-- courseRoutes.js
|   `-- studentRoutes.js
`-- utils/
    |-- apiResponse.js
    |-- asyncHandler.js
    |-- generateToken.js
    `-- queryFeatures.js
```

## Installation

```bash
cd C:\Users\kasas\Projects\SMS\Level-2\server
npm install
```

## Environment Variables

Create `.env` from `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://kasamounika887_db_user:Kasamouni%40123@cluster0.zxmbwb1.mongodb.net/edutrack?appName=Cluster0
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Important: if your Atlas password contains `@`, encode it as `%40`. The raw password `Kasamouni@123` must be written as `Kasamouni%40123` inside `MONGO_URI`.

Local MongoDB also works:

```env
MONGO_URI=mongodb://127.0.0.1:27017/edutrack
```

EduTrack must use the same `edutrack` database created by EduTrack. It reuses existing student records and adds users, teachers, parents, courses, departments, sections, subjects, attendance, and grades to the same database.

## MongoDB Atlas Setup

1. Create a free MongoDB Atlas cluster.
2. Create a database user with username and password.
3. Add your IP address in Atlas > Network Access > Add IP Address.
4. Copy the Node.js connection string.
5. Replace username and password in `MONGO_URI`, keeping the database name as `edutrack`.
6. Start the server with `npm run dev`.

## MongoDB Connection Debugging

The connection utility lives in `config/db.js`.

It checks:
- missing `.env`
- missing `MONGO_URI`
- invalid URI prefix
- unencoded `@` in the password
- Atlas cluster DNS failures
- Atlas Network Access / IP whitelist failures
- wrong database user password

Expected success log:

```txt
Connecting to MongoDB Atlas...
MongoDB Connected Successfully: cluster0-shard-00-00.xxxxx.mongodb.net
```

Common fixes:
- IP whitelist issue: Atlas > Network Access > Add IP Address > Add Current IP Address.
- Cluster paused: Atlas > Database > Resume.
- Wrong password: Atlas > Database Access > Edit database user > set a new password, then update `.env`.
- Invalid URI: use `mongodb+srv://USERNAME:ENCODED_PASSWORD@HOST/DATABASE?appName=Cluster0`.
- dotenv not loading: keep `.env` directly inside `Level-2/server`, then restart the server.
- Windows nodemon `EPERM`: close duplicate terminals, stop old Node processes, or use `npm start`.

## Models And Relationships

`User`
- `name`
- `email`
- `password`
- `role`: admin, teacher, student, parent

`Teacher`
- `teacherName`
- `email`
- `subject`
- `user`
- `assignedStudents`

`Parent`
- `parentName`
- `email`
- `phone`
- `childId`
- `user`

`Course`
- `courseName`
- `courseCode`
- `description`
- `instructor`

`Student`
- `studentName`
- `email`
- `course` references `Course`
- `user` references the student's login account
- `teacherId` references `Teacher`
- `parentId` references `Parent`
- `age`
- `attendance`
- `marks`
- `courseProgress`
- `recentActivity`
- `createdBy` references `User`

Relationship rules:
- One user can create many students through `Student.createdBy`.
- Many students can belong to one course through `Student.course`.
- One teacher can be assigned many students.
- One parent is linked to one child student.
- One student has one linked login account through `Student.user`.
- Controllers use `populate()` to return course and creator details.

## Database Features

- Mongoose schema validation
- Required fields
- Unique email and course code validation
- Email format validation
- Default values for attendance and marks
- Timestamps
- Indexes on `email`, `course`, and `createdAt`
- Virtual `grade` on students
- Pre-save hooks for normalization and password hashing
- Pagination and search utilities

## API Routes

Auth:

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/profile
```

Students:

```txt
GET    /api/students?search=aarav&page=1&limit=10
GET    /api/students/:id
POST   /api/students
PUT    /api/students/:id
PATCH  /api/students/:id/attendance
PATCH  /api/students/:id/grades
DELETE /api/students/:id
```

Teachers:

```txt
GET  /api/teachers
POST /api/teachers
```

Parents:

```txt
GET  /api/parents
POST /api/parents
```

Dashboard:

```txt
GET /api/dashboard
```

Announcements:

```txt
GET  /api/announcements
POST /api/announcements
```

Courses:

```txt
GET  /api/courses?search=mern&page=1&limit=10
POST /api/courses
GET  /api/courses/:id/students
```

## API Testing Guide

1. Register an admin:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "123456",
  "role": "admin"
}
```

2. Login and copy the returned JWT token.

3. Add this header to protected requests:

```txt
Authorization: Bearer YOUR_TOKEN
```

4. Create a course:

```json
{
  "courseName": "MERN Stack",
  "courseCode": "MERN101",
  "description": "MongoDB, Express, React, and Node.js",
  "instructor": "EduTrack Mentor"
}
```

5. Create a student using the course `_id`:

```json
{
  "studentName": "Aarav Sharma",
  "email": "aarav@example.com",
  "course": "COURSE_OBJECT_ID",
  "age": 21,
  "attendance": 88,
  "marks": 92,
  "courseProgress": 70
}
```

The student response includes one-time login credentials. Passwords are stored securely as bcrypt hashes in MongoDB.

6. Create a teacher:

```json
{
  "teacherName": "Priya Teacher",
  "email": "priya.teacher@example.com",
  "subject": "MERN Stack",
  "assignedStudents": ["STUDENT_OBJECT_ID"]
}
```

7. Create a parent:

```json
{
  "parentName": "Ravi Parent",
  "email": "ravi.parent@example.com",
  "phone": "9876543210",
  "childId": "STUDENT_OBJECT_ID"
}
```

8. Update student progress as admin or assigned teacher:

```json
PATCH /api/students/STUDENT_OBJECT_ID/attendance
{
  "attendance": 94
}
```

```json
PATCH /api/students/STUDENT_OBJECT_ID/grades
{
  "marks": 89,
  "courseProgress": 82
}
```

## Run

```bash
npm start
```

Development with nodemon:

```bash
npm run dev
```

Server URL:

```txt
http://localhost:5000
```

If port `5000` is already in use, close the other server or change `PORT` in `.env`.
