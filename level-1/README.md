# EduTrack

Smart Student Management System.

EduTrack introduces a Node.js/Express REST API, MongoDB with Mongoose, and a simple HTML/CSS/JavaScript frontend.

## Structure

```txt
Level-1/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- utils/
|   |   |-- app.js
|   |   `-- server.js
|   |-- .env.example
|   `-- package.json
|-- frontend/
|   |-- index.html
|   |-- style.css
|   `-- script.js
`-- README.md
```

The backend keeps source files under `backend/src` for cleaner architecture while still covering the EduTrack folders: config, models, routes, controllers, and server.

## Features

- Express server
- MongoDB connection
- Mongoose Student model
- REST CRUD APIs
- Fetch API frontend
- Add, edit, delete, and display students
- Responsive UI

## REST APIs

```txt
GET    /api/students
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id
```

## Run Backend

```bash
cd level-1/backend
copy .env.example .env
npm install
npm run dev
```

Backend URL:

```txt
http://localhost:5000
```

## Run Frontend

Open this file in a browser:

```txt
level-1/frontend/index.html
```

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/edutrack
```

Use the same `edutrack` database for EduTrack, EduTrack, and EduTrack so student records evolve through the project instead of being recreated per level.

## Testing Guide

1. Start the backend.
2. Open `frontend/index.html`.
3. Add a student from the form.
4. Edit a student record.
5. Delete a student record.
6. Confirm changes in MongoDB.
