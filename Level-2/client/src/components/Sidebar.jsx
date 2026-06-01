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
          <NavLink to="/profile">Profile</NavLink>
        </>
      )}

      {user.role === 'teacher' && (
        <>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/students">Students</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </>
      )}

      {user.role === 'student' && (
        <>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/profile">My Profile</NavLink>
        </>
      )}

      {user.role === 'parent' && (
        <>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/students">Child Profile</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </>
      )}

      <span className="role-badge">{user.role}</span>
    </aside>
  );
};

export default Sidebar;
