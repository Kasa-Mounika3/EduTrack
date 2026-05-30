import { NavLink, Outlet, useLocation } from 'react-router-dom';
import NotificationPanel from './NotificationPanel.jsx';
import Toast from './Toast.jsx';
import UpdateToast from './UpdateToast.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { resolveAssetUrl } from '../utils/assets.js';
import logo from '../assets/logo.png';

const SidebarLink = ({ to, children }) => (
  <NavLink to={to}>
    {children}
  </NavLink>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const avatar = resolveAssetUrl(user?.profilePhoto || '');
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/students/')) return 'Student Details';
    if (path.startsWith('/students')) {
      if (user.role === 'parent') return 'My Children';
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
    if (path.startsWith('/messages')) return 'Announcements';
    if (path.startsWith('/reports')) return 'Reports';
    if (path.startsWith('/profile')) return 'Profile';
    return 'EduTrack';
  };

  return (
    <div className="app-shell">
      <Toast />
      <UpdateToast />

      <header className="navbar">
        <NavLink to="/dashboard" className="brand">
          <img src={logo} alt="EduTrack Logo" className="brand-logo" />
          <span>
            <strong>EduTrack</strong>
            <small>Smart Student Management System</small>
          </span>
        </NavLink>

        <div className="navbar-page-title" style={{ fontSize: '1.25rem', fontWeight: 800, marginLeft: '24px', flexGrow: 1, color: 'var(--text)' }}>
          {getPageTitle()}
        </div>

        <nav className="top-nav" aria-label="Primary navigation">
          <NotificationPanel />
          <NavLink to="/profile" className="profile-nav-link">
            <span className="avatar tiny-avatar" aria-hidden="true">
              {avatar ? <img src={avatar} alt={user.name} /> : user.name.charAt(0)}
            </span>
            {user.name}
          </NavLink>
          <button className="nav-button" type="button" onClick={logout}>
            Logout
          </button>
        </nav>
      </header>

      <div className="app-body">
        <aside className="sidebar" aria-label="Sidebar navigation">
          <p className="sidebar-label">Menu</p>

          {user.role === 'admin' && (
            <>
              <SidebarLink to="/dashboard">Dashboard</SidebarLink>
              <SidebarLink to="/students">Students</SidebarLink>
              <SidebarLink to="/teachers">Teachers</SidebarLink>
              <SidebarLink to="/parents">Parents</SidebarLink>
              <SidebarLink to="/courses">Courses</SidebarLink>
              <SidebarLink to="/departments">Departments</SidebarLink>
              <SidebarLink to="/sections">Sections</SidebarLink>
              <SidebarLink to="/subjects">Subjects</SidebarLink>
              <SidebarLink to="/reports">Reports</SidebarLink>
              <SidebarLink to="/profile">Profile</SidebarLink>
            </>
          )}

          {user.role === 'teacher' && (
            <>
              <SidebarLink to="/dashboard">Dashboard</SidebarLink>
              <SidebarLink to="/my-subjects">My Subjects</SidebarLink>
              <SidebarLink to="/my-sections">My Sections</SidebarLink>
              <SidebarLink to="/students">Students</SidebarLink>
              <SidebarLink to="/attendance">Attendance</SidebarLink>
              <SidebarLink to="/marks">Marks</SidebarLink>
              <SidebarLink to="/messages">Announcements</SidebarLink>
              <SidebarLink to="/profile">Profile</SidebarLink>
            </>
          )}

          {user.role === 'student' && (
            <>
              <SidebarLink to="/dashboard">Dashboard</SidebarLink>
              <SidebarLink to="/profile">My Profile</SidebarLink>
              <SidebarLink to="/attendance">Attendance</SidebarLink>
              <SidebarLink to="/marks">Marks</SidebarLink>
              <SidebarLink to="/reports">Progress</SidebarLink>
              <SidebarLink to="/messages">Announcements</SidebarLink>
            </>
          )}

          {user.role === 'parent' && (
            <>
              <SidebarLink to="/dashboard">Dashboard</SidebarLink>
              <SidebarLink to="/students">Child Profile</SidebarLink>
              <SidebarLink to="/attendance">Attendance</SidebarLink>
              <SidebarLink to="/marks">Marks</SidebarLink>
              <SidebarLink to="/reports">Progress</SidebarLink>
              <SidebarLink to="/messages">Announcements</SidebarLink>
            </>
          )}

          <div className="sidebar-user-card">
            <span className="avatar" aria-hidden="true">
              {avatar ? <img src={avatar} alt={user.name} /> : user.name.charAt(0)}
            </span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
          <span className="role-badge">{user.role}</span>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
