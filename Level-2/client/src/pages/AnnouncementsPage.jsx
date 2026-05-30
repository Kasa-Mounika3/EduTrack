import { useEffect, useState } from 'react';
import Loader from '../components/Loader.jsx';
import { announcementService, getApiErrorMessage } from '../services/announcementService.js';
import { useAuth } from '../hooks/useAuth.js';

const AnnouncementsPage = () => {
  const { isAdmin, isTeacher } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({ title: '', message: '', audience: 'all' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      setAnnouncements(await announcementService.getAnnouncements());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await announcementService.createAnnouncement(formData);
      setFormData({ title: '', message: '', audience: 'all' });
      await loadAnnouncements();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Communication</p>
          <h1>Announcements</h1>
          <p>Admins and teachers can send updates to role-based audiences.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {(isAdmin || isTeacher) && (
        <div className="panel spaced-panel">
          <div className="panel-heading">
            <h2>Send Announcement</h2>
          </div>
          <form className="student-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                <span>Title</span>
                <input
                  value={formData.title}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                  required
                />
              </label>
              <label>
                <span>Audience</span>
                <select
                  value={formData.audience}
                  onChange={(event) => setFormData({ ...formData, audience: event.target.value })}
                >
                  <option value="all">All</option>
                  <option value="teachers">Teachers</option>
                  <option value="students">Students</option>
                  <option value="parents">Parents</option>
                </select>
              </label>
              <label>
                <span>Message</span>
                <input
                  value={formData.message}
                  onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                  required
                />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Send
            </button>
          </form>
        </div>
      )}

      <div className="panel">
        {loading ? (
          <Loader text="Loading announcements..." />
        ) : announcements.length ? (
          <div className="card-grid">
            {announcements.map((announcement) => (
              <article className="student-card" key={announcement._id}>
                <h3>{announcement.title}</h3>
                <p>{announcement.message}</p>
                <span className="role-badge">{announcement.audience}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No announcements yet</h3>
            <p>Important academic updates will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AnnouncementsPage;
