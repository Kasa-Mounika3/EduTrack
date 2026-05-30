# EduTrack Dashboard

React + Vite frontend for the EduTrack Task 1 EduTrack.

## Full Folder Structure

```txt
client/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── README.md
├── vite.config.js
├── public/
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── components/
    │   ├── Loader.jsx
    │   ├── Modal.jsx
    │   ├── Navbar.jsx
    │   ├── Notification.jsx
    │   ├── SearchBar.jsx
    │   ├── Sidebar.jsx
    │   ├── StudentCard.jsx
    │   ├── StudentForm.jsx
    │   └── StudentTable.jsx
    ├── context/
    │   └── StudentContext.jsx
    ├── hooks/
    │   └── useStudents.js
    ├── pages/
    │   ├── AddStudent.jsx
    │   ├── Dashboard.jsx
    │   ├── EditStudent.jsx
    │   ├── NotFound.jsx
    │   ├── StudentDetails.jsx
    │   └── StudentsPage.jsx
    ├── services/
    │   └── studentService.js
    └── styles/
        └── global.css
```

## Features

- React + Vite setup
- Functional components
- React Hooks
- React Router DOM routing
- Axios API integration
- JWT authentication support
- Protected routes
- Login, register, logout, and profile screens
- Context API state management
- Student CRUD screens
- Course management screen
- MongoDB relationship support through populated course data
- Search and filter
- Server-side pagination
- Loading states
- Error handling
- Success notifications
- Form validation
- Responsive dashboard UI

## Routes

| Route | Page |
| --- | --- |
| `/` | Dashboard |
| `/login` | Login |
| `/register` | Register |
| `/profile` | User profile |
| `/students` | Students list |
| `/students/:id` | Student details |
| `/add-student` | Add student |
| `/edit-student/:id` | Edit student |
| `/courses` | Course management |

## Backend API Connection

Create a `.env` file from `.env.example`:

```bash
copy .env.example .env
```

Default value:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Axios is configured in `src/services/studentService.js`.

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
```

The React app calls these backend endpoints:

| Action | Method | Endpoint |
| --- | --- | --- |
| Register | POST | `/api/auth/register` |
| Login | POST | `/api/auth/login` |
| User profile | GET | `/api/auth/profile` |
| Get all students | GET | `/api/students` |
| Get one student | GET | `/api/students/:id` |
| Add student | POST | `/api/students` |
| Update student | PUT | `/api/students/:id` |
| Delete student | DELETE | `/api/students/:id` |
| Get courses | GET | `/api/courses` |
| Add course | POST | `/api/courses` |

## Installation Steps

```bash
cd C:\Users\kasas\OneDrive\Desktop\SMS\level-2\client
npm install
```

## Run Commands

Start the React frontend:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## How To Run With Backend

1. Start MongoDB locally or use MongoDB Atlas.
2. Start the EduTrack backend:

```bash
cd C:\Users\kasas\OneDrive\Desktop\SMS\level-1\backend
npm run dev
```

3. Start this React client:

```bash
cd C:\Users\kasas\OneDrive\Desktop\SMS\level-2\client
npm install
npm run dev
```

4. Open the Vite URL:

```txt
http://localhost:5173
```

## How The Frontend Communicates With Backend

The React components do not call `fetch` directly. They use Axios service files:

- `src/services/apiClient.js` attaches `Authorization: Bearer TOKEN`
- `src/services/authService.js` handles login/register/profile/logout
- `src/services/studentService.js` handles student CRUD
- `src/services/courseService.js` handles course list/create APIs

Auth state lives in `AuthContext.jsx`, student state lives in `StudentContext.jsx`, and course state lives in `CourseContext.jsx`.

This keeps the project beginner-friendly and scalable for future MERN development.

## Database Integration Flow

1. Admin creates courses from `/courses`.
2. Student form loads courses from MongoDB through `/api/courses`.
3. New students save a `course` ObjectId reference.
4. Backend uses Mongoose `populate()` so the UI can display course code, name, and instructor.
5. Student listing uses backend pagination and search query params.

## JWT Frontend Flow

1. User logs in or registers.
2. Backend returns `token` and `user`.
3. React stores both in `localStorage`.
4. Protected routes use `ProtectedRoute.jsx`.
5. Axios sends the token with protected API requests.
6. Logout removes the token and user from `localStorage`.
