import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const Sidebar = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside className="sidebar" aria-label="Sidebar navigation">
      <p className="sidebar-label">Menu</p>

      {user.role === 'admin' && (
        <>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/students">Students</NavLink>
          <NavLink to="/teachers">Teachers</NavLink>
          <NavLink to="/parents">Parents</NavLink>
          <NavLink to="/courses">Courses</NavLink>
          <NavLink to="/departments">Departments</NavLink>
          <NavLink to="/sections">Sections</NavLink>
          <NavLink to="/subjects">Subjects</NavLink>
          <NavLink to="/progress">Reports</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </>
      )}

      {user.role === 'teacher' && (
        <>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/my-subjects">My Subjects</NavLink>
          <NavLink to="/my-sections">My Sections</NavLink>
          <NavLink to="/students">Students</NavLink>
          <NavLink to="/attendance">Attendance</NavLink>
          <NavLink to="/marks">Marks</NavLink>
          <NavLink to="/announcements">Announcements</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </>
      )}

      {user.role === 'student' && (
        <>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/profile">My Profile</NavLink>
          <NavLink to="/attendance">Attendance</NavLink>
          <NavLink to="/marks">Marks</NavLink>
          <NavLink to="/progress">Progress</NavLink>
          <NavLink to="/announcements">Announcements</NavLink>
        </>
      )}

      {user.role === 'parent' && (
        <>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/students">Child Profile</NavLink>
          <NavLink to="/attendance">Attendance</NavLink>
          <NavLink to="/marks">Marks</NavLink>
          <NavLink to="/progress">Progress</NavLink>
          <NavLink to="/announcements">Announcements</NavLink>
        </>
      )}

      <span className="role-badge">{user.role}</span>
    </aside>
  );
};

export default Sidebar;
