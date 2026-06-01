# 🎓 EduTrack – Level 1: Foundational Student Manager

Welcome to **Level 1** of EduTrack! This module establishes the structural database foundation and REST API architecture for the entire project. It focuses on core CRUD operations without the complexity of user authentication or role restrictions.

---

## 🏗️ Architecture & Overview

Level 1 acts as the base database builder. It introduces a lightweight Node.js/Express REST server connected to MongoDB, paired with a clean, fully responsive plain HTML5/CSS3/JavaScript frontend using the modern Fetch API.

> [!IMPORTANT]
> - **Authentication**: None required. There is no sign-in page, registration, or password hashing in Level 1.
> - **Roles**: Admin-only workspace. Anyone visiting the web interface can perform student CRUD actions.
> - **Database Connection**: All data is written to a shared `edutrack` database, which is designed to be carried forward and extended in Level 2 and Level 3.

```
┌─────────────────┐       Fetch API       ┌─────────────────┐       Mongoose       ┌──────────────────────┐
│  Vanilla Web UI │ ────────────────────> │ Express Server  │ ───────────────────> │ MongoDB Atlas        │
│  (index.html)   │ <──────────────────── │ (app.js/routes) │ <─────────────────── │ (shared 'edutrack')  │
└─────────────────┘       JSON Data       └─────────────────┘      BSON Schema     └──────────────────────┘
```

---

## 📁 Level 1 File Structure

```txt
level-1/
├── backend/
│   ├── src/
│   │   ├── config/       # Database configuration (db.js)
│   │   ├── controllers/  # Request handlers (studentController.js)
│   │   ├── middleware/   # Request pre-processors (error handling)
│   │   ├── models/       # Mongoose Schemas (Student.js)
│   │   ├── routes/       # API endpoints (studentRoutes.js)
│   │   ├── app.js        # Express application configuration
│   │   └── server.js     # Server entry point
│   ├── .env.example      # Example environment variables
│   └── package.json      # Node dependency registry
├── frontend/
│   ├── index.html        # Main dashboard dashboard
│   ├── style.css         # Custom layout styling
│   └── script.js         # Fetch API client and UI controller
└── README.md             # This documentation file
```

---

## 🛠️ REST API Specification

All student resources are manipulated through the standard REST interface:

| Method | Endpoint | Description | Payload Example |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/students` | Retrieve all student records | None |
| **POST** | `/api/students` | Create a new student | `{"name": "Alice", "email": "alice@gmail.com", "age": 20, "grade": "A"}` |
| **PUT** | `/api/students/:id` | Update an existing student | `{"name": "Alice", "age": 21}` |
| **DELETE** | `/api/students/:id` | Remove a student record | None |

---

## ⚙️ Setup & Local Execution

### 1. Run the Backend Server
Navigate to the backend directory, install the required packages, set up your environment variables, and start the development server.

```bash
cd level-1/backend
copy .env.example .env
npm install
npm run dev
```

#### Environment Variables (`backend/.env`)
Ensure your local `.env` is configured correctly:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/edutrack
```

The backend server will spin up and listen on `http://localhost:5000`.

### 2. Run the Frontend Dashboard
Since the frontend uses plain, compiled HTML5/CSS3/JavaScript, there is no build step or node package manager execution required.

Simply open the following file directly in any modern web browser:
```txt
level-1/frontend/index.html
```

---

## 🧪 Step-by-Step Verification Guide

1. **Verify Backend Connection**: Ensure the server starts successfully and outputs `"MongoDB Connected..."` in the console.
2. **Create Student**: Open `index.html` in your browser, fill in the "Add Student" form, and click **Submit**. Confirm the student is rendered in the list.
3. **Verify in MongoDB**: Open MongoDB Compass or log in to the Atlas dashboard to ensure a record was created in the `edutrack` database under the `students` collection.
4. **Edit Student**: Click the **Edit** button next to a student, modify their details, and submit. The record should update in the list immediately.
5. **Delete Student**: Click the **Delete** button next to a student. The student should be removed from both the UI and the MongoDB collection.
