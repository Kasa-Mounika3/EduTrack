# 🎓 EduTrack – Level 2: Multi-Role Student & Course CRUD Portal

Welcome to **Level 2** of EduTrack! This level upgrades the foundational CRUD REST API into a robust client-server portal featuring React, secure login mechanisms, role-based authorization, and course-student relationships.

---

## 🏛️ Architecture & Role-Based Workflows

Level 2 splits the project into a separate client-server structure. A modern React SPA manages the frontend view routing using React Router DOM, communicating securely with a JWT-protected Express API server using Axios.

### Key Roles & Operations

| Role | Key Permissions & Operations |
| :--- | :--- |
| **👑 Admin** | Manage Courses. Create Students, Teachers, and Parents (which auto-generates their secure login credentials). Assign courses, teachers, and parents to students. Broadcast school announcements. |
| **👨‍🏫 Teacher** | Access dashboard, view assigned students, update attendance rates and assessment marks on individual student profiles, and review profiles. |
| **👶 Student** | Access dashboard, view profile details, track current course list, review marks/grades/remarks, and read announcements. |
| **👪 Parent** | Monitor child's profile details, Child's academic grades, child's course progress, and announcements. |

---

## 📁 Level 2 File Structure

```txt
Level-2/
├── client/
│   ├── src/
│   │   ├── components/  # Layout, Navbar, ProtectedRoutes, StudentForm, CourseForm
│   │   ├── context/     # AuthContext and state providers
│   │   ├── hooks/       # Custom React state hooks
│   │   ├── pages/       # Login, Dashboard, Students, Teachers, Parents, Courses, Profile
│   │   ├── services/    # Axios API client and route requests
│   │   └── styles/      # Tailwind CSS config and stylesheets
│   ├── .env.example     # Client configuration environment variables
│   └── package.json     # React application dependencies
└── server/
    ├── config/          # Database and authentication configs
    ├── controllers/     # Request handlers for Auth, Dashboard, Student, Teacher, Parent, Course
    ├── middleware/      # JWT verification, Role authorization, Error handler
    ├── models/          # Relational Schemas (Course, Parent, Student, Teacher, User)
    ├── routes/          # REST Endpoint Routers
    ├── utils/           # Helper scripts (Token generators, Parent linking)
    ├── .env.example     # Server configuration environment variables
    └── package.json     # Server dependencies
```

---

## 🔒 Security & Data Relationships

* **Authentication**: Password encryption using `bcrypt` and session-based request security using JSON Web Tokens (JWT).
* **Shared Database**: Connects to the same `edutrack` MongoDB Atlas cluster. Extends student data from Level 1 with new user roles, courses, and announcements.
* **Relations**: Models are interlinked via Mongoose `ObjectId` references. Students link to courses, teachers, and parents.
* **Advanced Features Omitted**: All academic hierarchical structures (such as cascading Departments, Sections, Subjects, and Academic Years), custom socket engines, real-time messaging, and advanced report analytics are omitted and reserved for the **Level 3** advanced build.

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

### 📝 Academics & Communications
* `PATCH /api/students/:id/attendance` – Update student attendance percentage (Teacher).
* `PATCH /api/students/:id/grades` – Update student marks, progress, and remarks (Teacher).
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
2. **Setup Core Data**:
   * Create a **Course** (e.g., Computer Science).
   * Create a **Teacher** and assign a subject.
   * Create a **Student** and associate them with the Course.
   * Create a **Parent** and select their Child student.
3. **Teacher Operations**: Log out of Admin, log in as the newly created Teacher:
   * View the student roster on the Dashboard.
   * Click on a student's profile to **Update Progress**.
   * Update their Attendance percentage, Marks, and Teacher Remarks, then click save.
4. **Student & Parent Dashboard Audit**: Log in as Student or Parent and verify read-only grids show the updated attendance, marks, and announcements.
