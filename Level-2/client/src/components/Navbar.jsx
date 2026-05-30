import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { resolveAssetUrl } from '../utils/assets.js';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const avatar = resolveAssetUrl(user?.profilePhoto || '');
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/students/')) return 'Student Details';
    if (path.startsWith('/students')) {
      if (user?.role === 'parent') return 'My Children';
      return 'Students';
    }
    if (path.startsWith('/add-student')) return 'Add Student';
    if (path.startsWith('/edit-student')) return 'Edit Student';
    if (path.startsWith('/teachers')) return 'Teachers';
    if (path.startsWith('/parents')) return 'Parents';
    if (path.startsWith('/courses')) return 'Courses';
    if (path.startsWith('/departments')) return 'Departments';
    if (path.startsWith('/sections')) return 'Sections';
    if (path.startsWith('/subjects')) return 'Subjects';
    if (path.startsWith('/my-subjects')) return 'My Subjects';
    if (path.startsWith('/my-sections')) return 'My Sections';
    if (path.startsWith('/attendance')) return 'Attendance';
    if (path.startsWith('/marks')) return 'Marks';
    if (path.startsWith('/progress')) return 'Progress';
    if (path.startsWith('/announcements')) return 'Announcements';
    if (path.startsWith('/profile')) return 'Profile';
    return 'EduTrack';
  };

  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        <img src={logo} alt="EduTrack Logo" className="brand-logo" />
        <span>
          <strong>EduTrack</strong>
          <small>Smart Student Management System</small>
        </span>
      </NavLink>

      {isAuthenticated && (
        <div className="navbar-page-title" style={{ fontSize: '1.25rem', fontWeight: 800, marginLeft: '24px', flexGrow: 1, color: 'var(--text)' }}>
          {getPageTitle()}
        </div>
      )}

      <nav className="top-nav" aria-label="Primary navigation">
        {isAuthenticated ? (
          <>
            <NavLink to="/profile" className="profile-nav-link">
              <span className="avatar tiny-avatar" aria-hidden="true">
                {avatar ? <img src={avatar} alt={user.name} /> : user.name.charAt(0)}
              </span>
              {user.name}
            </NavLink>
            <button className="nav-button" type="button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
