import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { dashboardService } from '../services/dashboardService.js';
import { getApiError } from '../services/api.js';

const roleCopy = {
  admin: {
    eyebrow: 'Admin Dashboard',
    description: 'Manage institution growth, people, courses, and academic signals from one place.',
    actionLabel: 'Add New Student',
    actionTo: '/add-student'
  },
  teacher: {
    eyebrow: 'Teacher Dashboard',
    description: 'Track assigned sections, update academic records, and follow classroom activity.',
    actionLabel: 'Review Students',
    actionTo: '/students'
  },
  student: {
    eyebrow: 'Student Dashboard',
    description: 'View attendance, grades, course progress, notifications, and recent activity.',
    actionLabel: 'View Reports',
    actionTo: '/reports'
  },
  parent: {
    eyebrow: 'Parent Dashboard',
    description: 'Monitor child attendance, grades, teacher feedback, and progress reports.',
    actionLabel: 'Child Reports',
    actionTo: '/reports'
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      setError('');

      try {
        setSummary(await dashboardService.summary());
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const copy = roleCopy[user.role] || roleCopy.student;
  const analytics = summary?.analytics || {};
  const totals = summary?.totals || {};
  const recentStudents = summary?.recentStudents || [];
  const teacherProfile = summary?.teacherProfile || null;

  const cards = useMemo(() => {
    const baseCards = [
      { label: 'Students', value: totals.students ?? 0, helper: user.role === 'parent' ? 'Linked child records' : 'Visible learner records' },
      { label: 'Courses', value: totals.courses ?? 0, helper: 'Active academic programs' },
      { label: 'Attendance', value: `${analytics.averageAttendance ?? 0}%`, helper: 'Average visible attendance' },
      { label: 'Average Score', value: analytics.averageMarks ?? 0, helper: 'Across visible learners' }
    ];

    if (user.role === 'admin') {
      return [
        baseCards[0],
        { label: 'Teachers', value: totals.teachers ?? 0, helper: 'Faculty accounts' },
        { label: 'Parents', value: totals.parents ?? 0, helper: 'Guardian accounts' },
        baseCards[1]
      ];
    }

    return baseCards;
  }, [analytics.averageAttendance, analytics.averageMarks, totals, user.role]);

  if (loading) {
    return (
      <section className="page">
        <PageHeader eyebrow={copy.eyebrow} title={`Welcome, ${user.name}`} description={copy.description} />
        <Skeleton rows={5} />
      </section>
    );
  }

  return (
    <section className="page">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={`Welcome, ${user.name}`}
        description={copy.description}
        action={<Link className="primary-link" to={copy.actionTo}>{copy.actionLabel}</Link>}
      />

      {error && <div className="alert error">{error}</div>}

      <div className="stats-grid">
        {cards.map((card) => (
          <article className="stat-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p className="muted-text">{card.helper}</p>
          </article>
        ))}
      </div>

      <div className="card-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>{user.role === 'parent' ? 'Child Activity' : user.role === 'student' ? 'My Progress' : 'Recent Academic Activity'}</h2>
            <Link className="text-link" to="/students">View records</Link>
          </div>

          {recentStudents.length === 0 ? (
            <EmptyState title="No activity yet" message="Academic activity appears here once student records are updated." />
          ) : (
            <div className="student-card-list">
              {recentStudents.map((student) => {
                const displayName = student.studentName || student.name || 'Student';
                return (
                <Link className="student-card compact-student-card" to={`/students/${student._id}`} key={student._id}>
                  <div className="avatar" aria-hidden="true">
                    {student.profilePhoto ? <img src={student.profilePhoto} alt={displayName} /> : displayName.charAt(0)}
                  </div>
                  <div>
                    <h3>{displayName}</h3>
                    <p>{student.course?.courseName || 'Course pending'}</p>
                  </div>
                  <dl>
                    <div>
                      <dt>Attendance</dt>
                      <dd>{student.attendance ?? 0}%</dd>
                    </div>
                    <div>
                      <dt>Score</dt>
                      <dd>{student.marks ?? 0}</dd>
                    </div>
                    <div>
                      <dt>Grade</dt>
                      <dd>{student.grade}</dd>
                    </div>
                  </dl>
                </Link>
                );
              })}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Advanced Analytics</h2>
          </div>
          <div className="analytics-bars">
            <div>
              <div className="bar-label">
                <span>Attendance</span>
                <strong>{analytics.averageAttendance ?? 0}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${analytics.averageAttendance ?? 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="bar-label">
                <span>Score</span>
                <strong>{analytics.averageMarks ?? 0}</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill accent-fill" style={{ width: `${analytics.averageMarks ?? 0}%` }}></div>
              </div>
            </div>
          </div>
          <div className="detail-actions">
            <Link className="ghost-link" to="/reports">Open Reports</Link>
            <Link className="ghost-link" to="/messages">Send Announcement</Link>
          </div>
        </article>
      </div>
    </section>
  );
};

export default Dashboard;
