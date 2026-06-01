# 🎓 EduTrack – Level 2: Multi-Role Academic Portal

Welcome to **Level 2** of EduTrack! This level transforms the foundational CRUD database into a robust multi-role academic portal. It introduces React, secure login mechanisms, role-based authorization, and deep relational MongoDB schemas.

---

## 🏛️ Architecture & Role-Based Authorization

Level 2 splits the project into a separate client-server structure. A modern React SPA manages the frontend view routing using React Router DOM, communicating securely with a JWT-protected Express API server using Axios.

### The Four Roles & Workflows

| Role | Key Permissions & Operations |
| :--- | :--- |
| **👑 Admin** | Create Courses, Departments, Sections, and Subjects. Create Students, Teachers, and Parents (which auto-generates their login credentials). Bind parents and teachers to students. Broadcast school announcements. |
| **👨‍🏫 Teacher** | View assigned sections and subjects. Mark student attendance (Present, Absent, Late) on an interactive sheet. Manage grade sheets (input marks, grades, and remarks). Broadcast class announcements. |
| **👶 Student** | Access read-only analytics. Track subject-wise attendance percentages, review published marks/grades, view current course list, and read announcements. |
| **👪 Parent** | Monitor child's academic performance. View child's profile, attendance charts, grade sheets, and school announcements. Includes a child selector for parents with multiple children. |

---

## 📁 Level 2 File Structure

```txt
Level-2/
├── client/
│   ├── src/
│   │   ├── components/  # Layout, Navbar, ProtectedRoutes, Shared UI
│   │   ├── context/     # AuthContext and state providers
│   │   ├── hooks/       # Custom React state hooks
│   │   ├── pages/       # Login, Dashboard, Students, Teachers, Parents, Courses, etc.
│   │   ├── services/    # Axios API client and route requests
│   │   └── styles/      # Tailwind CSS config and stylesheets
│   ├── .env.example     # Client configuration environment variables
│   └── package.json     # React application dependencies
└── server/
    ├── config/          # Database and authentication configs
    ├── controllers/     # Request handlers for Auth, Academic, Student, Teacher, Parent
    ├── middleware/      # JWT verification, Role authorization, Error handler
    ├── models/          # Relational Schemas (Course, Department, Section, Subject, User, etc.)
    ├── routes/          # REST Endpoint Routers
    ├── utils/           # Helper scripts (Token generators)
    ├── .env.example     # Server configuration environment variables
    └── package.json     # Server dependencies
```

---

## 🔒 Security & Data Relationships

* **Authentication**: Password encryption using `bcrypt` and session-based request security using JSON Web Tokens (JWT).
* **Shared Database**: Connects to the same `edutrack` MongoDB Atlas cluster. Extends student data from Level 1 with new user roles, courses, attendance sheets, assessment collections, and announcements.
* **Relations**: Models are deeply interlinked via Mongoose `ObjectId` references. Students link to courses/parents; teachers link to sections/subjects.

---

## 🔌 Primary API Reference

### 🔐 Authentication & Session
* `POST /api/auth/register` – Create first Admin account.
* `POST /api/auth/login` – Authenticate user and sign JWT.
* `GET /api/auth/profile` – Fetch current user profile.

### 👑 Admin & Management
* `GET/POST /api/students` – Manage student profiles (auto-creates User logins).
* `GET/POST /api/teachers` – Manage teacher directories (auto-creates User logins).
* `GET/POST /api/parents` – Manage parent accounts (auto-creates User logins).
* `GET/POST /api/courses` – Manage school courses.

### 📂 Academic Structure
* `GET /api/academic` – Retrieve all academic years, departments, sections, and subjects.
* `POST /api/academic/department` – Create a new academic department.
* `POST /api/academic/section` – Create a section (under a department & course).
* `POST /api/academic/subject` – Create a subject (assigning code, course, and teacher).

### 📝 Academics & Communications
* `PATCH /api/students/:id/attendance` – Update student attendance (Teacher).
* `PATCH /api/students/:id/grades` – Update student assessment scores (Teacher).
* `GET/POST /api/announcements` – Create and retrieve system announcements.

---

## ⚙️ Setup & Local Execution

### 1. Start the Server
Navigate to the server directory, install node modules, configure environment, and run:
```bash
cd Level-2/server
copy .env.example .env
npm install
npm run dev
```

#### Server Environment (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/edutrack
JWT_SECRET=your_long_secure_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 2. Start the Client App
Navigate to the client directory, install packages, configure the API endpoint, and run:
```bash
cd Level-2/client
copy .env.example .env
npm install
npm run dev
```

#### Client Environment (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Open your browser and navigate to the application dashboard at `http://localhost:5173`.

---

## 🧪 Detailed Verification Walkthrough

1. **Admin Initial Registration**: Load `http://localhost:5173/register`, create the first Admin user, and log in.
2. **Academic Structure Creation**:
   * Create a **Course** (e.g., Computer Science).
   * Create a **Department** (e.g., Department of Engineering).
   * Create a **Section** (e.g., CS-2026).
   * Create a **Subject** (e.g., Database Systems).
3. **Account Provisioning**:
   * Add a **Teacher** and assign them to the Section/Subject.
   * Add a **Student** and associate them with the Course/Section.
   * Add a **Parent** and select their Child student.
4. **Teacher Operations**: Log out of Admin, log in as the newly created Teacher:
   * View the student roster.
   * Open **Attendance** and mark students Present/Absent.
   * Open **Marks** and record assessment grades.
5. **Student & Parent Dashboard Audit**: Log in as Student or Parent and verify read-only grids show the attendance percentages, marks, and announcements.
