# EduTrack – Smart Student Management System

EduTrack is a Student Management System built level-by-level from a basic REST API to a production-style MERN application with REST, GraphQL, Socket.io, JWT authentication, and MongoDB.

## Project Structure

```txt
Student-Management-System/
|-- Level-1/
|   |-- backend/
|   |-- frontend/
|   `-- README.md
|-- Level-2/
|   |-- client/
|   |-- server/
|   `-- README.md
|-- Level-3/
|   |-- client/
|   |-- server/
|   `-- README.md
`-- README.md
```

> Note: On this machine the Level 1 folder may still display as `level-1` if Windows is holding a file lock. It contains the same Level 1 project.

## Level Summary

Level 1 - Basic:
- Node.js and Express REST API
- MongoDB and Mongoose Student model
- CRUD endpoints for students
- HTML, CSS, and JavaScript frontend using Fetch API

Level 2 - Intermediate:
- React frontend with React Router DOM
- Axios API services
- JWT authentication and bcrypt password hashing
- Admin/student roles, protected routes, search, pagination, and course relationships

Level 3 - Advanced:
- Full MERN application
- Existing REST APIs preserved
- Apollo GraphQL API as an alternative API layer
- Socket.io real-time notifications, announcements, messages, and dashboard updates
- Apollo Client and Socket.io Client integrated into React

## Final Level 3 URLs

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:5000
GraphQL:  http://localhost:5000/graphql
REST:     http://localhost:5000/api
```

## Run The Final App

Backend:

```bash
cd Level-3/server
copy .env.example .env
npm install
npm run dev
```

Frontend:

```bash
cd Level-3/client
copy .env.example .env
npm install
npm run dev
```

## Environment Variables

Level 3 server `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/edutrack
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Level 3 client `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## REST, GraphQL, And Socket.io Together

REST remains available under `/api/*` for internship proof and traditional CRUD testing.

GraphQL is available at `/graphql` and uses the same MongoDB models, JWT secret, and authentication rules as REST.

Socket.io runs on the same backend server at `http://localhost:5000` and provides real-time notifications, announcements, messages, and dashboard updates.

## Deployment

Backend can be deployed to Render from `Level-3/server`.

Frontend can be deployed to Vercel from `Level-3/client`.

Set `CLIENT_URL` on the backend to your Vercel URL, and set `VITE_API_BASE_URL` on the frontend to your Render API URL ending in `/api`.
