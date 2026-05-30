import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Sidebar from './components/Sidebar.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AnnouncementsPage from './pages/AnnouncementsPage.jsx';
import ParentsPage from './pages/ParentsPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import AddStudent from './pages/AddStudent.jsx';
import EditStudent from './pages/EditStudent.jsx';
import StudentDetails from './pages/StudentDetails.jsx';
import TeachersPage from './pages/TeachersPage.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import Profile from './pages/Profile.jsx';
import Register from './pages/Register.jsx';
import Departments from './pages/Departments.jsx';
import Sections from './pages/Sections.jsx';
import Subjects from './pages/Subjects.jsx';
import MySubjects from './pages/MySubjects.jsx';
import MySections from './pages/MySections.jsx';
import Attendance from './pages/Attendance.jsx';
import Marks from './pages/Marks.jsx';
import Progress from './pages/Progress.jsx';
import { useAuth } from './hooks/useAuth.js';

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-shell">
      <Navbar />
      <div className={`app-body ${isAuthenticated ? '' : 'no-sidebar'}`}>
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <CoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TeachersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parents"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ParentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/announcements"
              element={
                <ProtectedRoute>
                  <AnnouncementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/:id"
              element={
                <ProtectedRoute>
                  <StudentDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-student"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AddStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-student/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <EditStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/departments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sections"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Sections />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Subjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-subjects"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <MySubjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-sections"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <MySections />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marks"
              element={
                <ProtectedRoute>
                  <Marks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
