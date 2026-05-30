import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Loader from './components/Loader.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './hooks/useAuth.js';

const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Students = lazy(() => import('./pages/Students.jsx'));
const StudentFormPage = lazy(() => import('./pages/StudentFormPage.jsx'));
const StudentDetails = lazy(() => import('./pages/StudentDetails.jsx'));
const Courses = lazy(() => import('./pages/Courses.jsx'));
const Teachers = lazy(() => import('./pages/Teachers.jsx'));
const Parents = lazy(() => import('./pages/Parents.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Messages = lazy(() => import('./pages/Messages.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

const Departments = lazy(() => import('./pages/Departments.jsx'));
const Sections = lazy(() => import('./pages/Sections.jsx'));
const Subjects = lazy(() => import('./pages/Subjects.jsx'));
const MySubjects = lazy(() => import('./pages/MySubjects.jsx'));
const MySections = lazy(() => import('./pages/MySections.jsx'));
const Attendance = lazy(() => import('./pages/Attendance.jsx'));
const Marks = lazy(() => import('./pages/Marks.jsx'));
const Progress = lazy(() => import('./pages/Progress.jsx'));

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  return (
    <Suspense fallback={<Loader text="Preparing EduTrack..." />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetails />} />
          <Route path="/add-student" element={<ProtectedRoute roles={['admin']}><StudentFormPage mode="add" /></ProtectedRoute>} />
          <Route path="/edit-student/:id" element={<StudentFormPage mode="edit" />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/teachers" element={<ProtectedRoute roles={['admin']}><Teachers /></ProtectedRoute>} />
          <Route path="/parents" element={<ProtectedRoute roles={['admin']}><Parents /></ProtectedRoute>} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/realtime" element={<Navigate to="/messages" replace />} />
          <Route path="/profile" element={<Profile />} />

          {/* New Academic Management Routes */}
          <Route path="/departments" element={<ProtectedRoute roles={['admin']}><Departments /></ProtectedRoute>} />
          <Route path="/sections" element={<ProtectedRoute roles={['admin']}><Sections /></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute roles={['admin']}><Subjects /></ProtectedRoute>} />
          <Route path="/my-subjects" element={<ProtectedRoute roles={['teacher']}><MySubjects /></ProtectedRoute>} />
          <Route path="/my-sections" element={<ProtectedRoute roles={['teacher']}><MySections /></ProtectedRoute>} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/marks" element={<Marks />} />
          <Route path="/progress" element={<Progress />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
