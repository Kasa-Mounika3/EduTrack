import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader.jsx';
import Notification from '../components/Notification.jsx';
import StudentCard from '../components/StudentCard.jsx';
import { dashboardService, getApiErrorMessage } from '../services/dashboardService.js';
import { useAuth } from '../hooks/useAuth.js';

const ProgressSummary = ({ student }) => {
  if (!student) {
    return (
      <div className="empty-state">
        <h3>No academic profile yet</h3>
        <p>Ask an admin to create and connect the student profile.</p>
      </div>
    );
  }
  const displayName = student.studentName || student.name || 'Student';

  return (
    <>
      <div className="stats-grid">
        <article className="stat-card">
          <span>Attendance</span>
          <strong>{student.attendance ?? 0}%</strong>
        </article>
        <article className="stat-card">
          <span>Marks</span>
          <strong>{student.marks ?? 0}</strong>
        </article>
        <article className="stat-card">
          <span>Progress</span>
          <strong>{student.courseProgress ?? 0}%</strong>
        </article>
      </div>
      <div className="panel">
        <div className="panel-heading">
          <h2>{displayName}</h2>
          <Link className="text-link" to={`/students/${student._id}`}>
            View profile
          </Link>
        </div>
        <p className="muted-text">
          Course:{' '}
          {typeof student.course === 'object'
            ? `${student.course.courseCode} - ${student.course.courseName}`
            : student.course || 'Not assigned'}
        </p>
        <p className="muted-text">Grade: {student.grade || 'Not graded'}</p>
      </div>
    </>
  );
};

const AnnouncementList = ({ announcements = [] }) => (
  <div className="panel spaced-panel">
    <div className="panel-heading">
      <h2>Notifications</h2>
      <Link className="text-link" to="/announcements">
        View all
      </Link>
    </div>
    {announcements.length ? (
      <div className="card-grid">
        {announcements.map((item) => (
          <article className="student-card" key={item._id}>
            <h3>{item.title}</h3>
            <p>{item.message}</p>
            <span className="role-badge">{item.audience}</span>
          </article>
        ))}
      </div>
    ) : (
      <div className="empty-state">
        <h3>No notifications</h3>
        <p>Announcements from admins and teachers will appear here.</p>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setDashboard(await dashboardService.getDashboard());
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <Loader text="Loading dashboard..." />;
  }

  const announcements = dashboard?.announcements || [];

  return (
    <section className="page">
      <Notification />
      <div className="page-header">
        <div>
          <p className="eyebrow">{user.role} workspace</p>
          <h1>EduTrack Dashboard</h1>
          <p>Role-based academic overview and student records system.</p>
        </div>
        {user.role === 'admin' && (
          <Link className="primary-link" to="/add-student">
            Add Student
          </Link>
        )}
      </div>

      {error && <div className="alert error">{error}</div>}

      {dashboard?.role === 'admin' && (
        <>
          <div className="stats-grid">
            <article className="stat-card">
              <span>Students</span>
              <strong>{dashboard.stats.students}</strong>
            </article>
            <article className="stat-card">
              <span>Teachers</span>
              <strong>{dashboard.stats.teachers}</strong>
            </article>
            <article className="stat-card">
              <span>Parents</span>
              <strong>{dashboard.stats.parents}</strong>
            </article>
            <article className="stat-card">
              <span>Courses</span>
              <strong>{dashboard.stats.courses || 0}</strong>
            </article>
          </div>
          <div className="panel spaced-panel">
            <div className="panel-heading">
              <h2>Recent Students</h2>
              <Link className="text-link" to="/students">
                Manage
              </Link>
            </div>
            <div className="card-grid">
              {(dashboard.recentStudents || []).map((student) => (
                <StudentCard key={student._id} student={student} />
              ))}
            </div>
          </div>
        </>
      )}

      {dashboard?.role === 'teacher' && (
        <>
          <div className="stats-grid">
            <article className="stat-card">
              <span>Assigned Students</span>
              <strong>{dashboard.students.length}</strong>
            </article>
            <article className="stat-card">
              <span>Subject</span>
              <strong>{dashboard.teacher?.subject || '-'}</strong>
            </article>
            <article className="stat-card">
              <span>Role</span>
              <strong>Teacher</strong>
            </article>
          </div>
          <div className="panel spaced-panel">
            <div className="panel-heading">
              <h2>Assigned Students</h2>
              <Link className="text-link" to="/students">
                Update progress
              </Link>
            </div>
            <div className="card-grid">
              {dashboard.students.map((student) => (
                <StudentCard key={student._id} student={student} />
              ))}
            </div>
          </div>
        </>
      )}

      {dashboard?.role === 'student' && <ProgressSummary student={dashboard.student} />}
      {dashboard?.role === 'parent' && (
        <div className="card-grid">
          {(dashboard.students?.length ? dashboard.students : [dashboard.child].filter(Boolean)).map((student) => (
            <ProgressSummary key={student._id} student={student} />
          ))}
        </div>
      )}

      <AnnouncementList announcements={announcements} />
    </section>
  );
};

export default Dashboard;
