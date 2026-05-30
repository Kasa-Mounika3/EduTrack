import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { getApiError } from '../services/api.js';
import { realtimeService } from '../services/realtimeService.js';

const AnnouncementForm = () => {
  const [form, setForm] = useState({ title: '', subject: '', message: '', targetAudience: 'students', departmentId: '', year: '', sectionId: '' });
  const [academic, setAcademic] = useState({ departments: [], sections: [] });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/academic')
      .then((response) => setAcademic(response.data.data || { departments: [], sections: [] }))
      .catch(() => setAcademic({ departments: [], sections: [] }));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    setError('');

    if (!form.title.trim() || !form.message.trim()) return;

    try {
      const result = await realtimeService.sendNotification(form);
      setStatus(`Announcement published. Email ${result.emailDelivery?.status || 'queued'}.`);
      setForm({ title: '', subject: '', message: '', targetAudience: 'students', departmentId: '', year: '', sectionId: '' });
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <form className="panel grid gap-4" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Announcements</p>
        <h2 className="text-xl font-black">Send Announcement</h2>
      </div>
      {status && <div className="notification">{status}</div>}
      {error && <div className="alert error">{error}</div>}
      <div className="grid gap-4 md:grid-cols-3">
        <label className="label">
          Title
          <input className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </label>
        <label className="label">
          Subject
          <input className="input" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} />
        </label>
        <label className="label">
          Audience
          <select className="input" value={form.targetAudience} onChange={(event) => setForm({ ...form, targetAudience: event.target.value })}>
            <option value="students">All Students</option>
            <option value="teachers">All Teachers</option>
            <option value="parents">All Parents</option>
            <option value="department">Specific Department</option>
            <option value="year">Specific Year</option>
            <option value="section">Specific Section</option>
          </select>
        </label>
        <label className="label">
          Department
          <select className="input" value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value, sectionId: '' })}>
            <option value="">Any department</option>
            {academic.departments.map((department) => (
              <option key={department._id} value={department._id}>{department.departmentName}</option>
            ))}
          </select>
        </label>
        <label className="label">
          Year
          <input className="input" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} placeholder="3rd Year" />
        </label>
        <label className="label">
          Section
          <select className="input" value={form.sectionId} onChange={(event) => setForm({ ...form, sectionId: event.target.value })}>
            <option value="">Any section</option>
            {academic.sections
              .filter((section) => !form.departmentId || section.department?._id === form.departmentId || section.department === form.departmentId)
              .map((section) => (
                <option key={section._id} value={section._id}>{section.year} - Section {section.sectionName}</option>
              ))}
          </select>
        </label>
        <label className="label md:col-span-3">
          Message
          <input className="input" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
        </label>
      </div>
      <button className="btn-primary w-fit" type="submit">Send Announcement</button>
    </form>
  );
};

export default AnnouncementForm;
