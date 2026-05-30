import { useEffect, useState } from 'react';
import Loader from '../components/Loader.jsx';
import { getApiErrorMessage, parentService } from '../services/parentService.js';
import { studentService } from '../services/studentService.js';

const ParentsPage = () => {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    childId: '',
    password: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [parentData, studentResult] = await Promise.all([
        parentService.getParents(),
        studentService.getStudents({ limit: 100 })
      ]);
      setParents(parentData);
      setStudents(studentResult.students);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = new FormData();
      Object.entries({ ...formData, password: formData.password || undefined }).forEach(([key, value]) => {
        if (value !== undefined && value !== '') payload.append(key, value);
      });
      if (photoFile) payload.append('profilePhoto', photoFile);
      const result = await parentService.createParent(payload);
      setCredentials(result.loginCredentials);
      setFormData({ parentName: '', email: '', phone: '', childId: '', password: '' });
      setPhotoFile(null);
      setPhotoPreview('');
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const viewParent = (parent) => {
    const children = parent.linkedStudents?.map((student) => student.studentName || student.name).join(', ') || parent.childId?.studentName || 'None linked';
    window.alert(`${parent.parentName}\n${parent.email}\nPhone: ${parent.phone || 'Not added'}\nStudents: ${children}`);
  };

  const editParent = async (parent) => {
    const parentName = window.prompt('Parent name', parent.parentName);
    if (!parentName) return;
    const phone = window.prompt('Phone', parent.phone || '') ?? parent.phone;
    await parentService.updateParent(parent._id, { parentName, phone });
    await loadData();
  };

  const deleteParent = async (parent) => {
    if (!window.confirm(`Delete ${parent.parentName}?`)) return;
    await parentService.deleteParent(parent._id);
    await loadData();
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Parents</h1>
          <p>Create parent accounts and connect them to child academic dashboards.</p>
        </div>
        <div className="count-pill">{parents.length} parents</div>
      </div>

      {credentials && (
        <div className="notification">
          Parent login created: {credentials.email} / {credentials.temporaryPassword}
        </div>
      )}
      {error && <div className="alert error">{error}</div>}

      <div className="panel spaced-panel">
        <div className="panel-heading">
          <h2>Add Parent</h2>
        </div>
        <form className="student-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <span>Profile Photo</span>
              <div className="details-card">
                <div className="avatar large-avatar" aria-hidden="true">
                  {photoPreview ? <img src={photoPreview} alt={formData.parentName || 'Parent'} /> : (formData.parentName || 'P').charAt(0)}
                </div>
                <label className="secondary-button">
                  Choose Image
                  <input
                    hidden
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setPhotoFile(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
                {photoPreview && <button className="text-link" type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(''); }}>Remove photo</button>}
              </div>
            </div>
            <label>
              <span>Name</span>
              <input
                name="parentName"
                value={formData.parentName}
                onChange={(event) => setFormData({ ...formData, parentName: event.target.value })}
                required
              />
            </label>
            <label>
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                required
              />
            </label>
            <label>
              <span>Phone</span>
              <input
                name="phone"
                value={formData.phone}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
              />
            </label>
            <label>
              <span>Child Student</span>
              <select
                name="childId"
                value={formData.childId}
                onChange={(event) => setFormData({ ...formData, childId: event.target.value })}
                required
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.studentName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Password</span>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                placeholder="Leave blank to auto-generate"
              />
            </label>
          </div>
          <button className="primary-button" type="submit">
            Create Parent
          </button>
        </form>
      </div>

      <div className="panel">
        {loading ? (
          <Loader text="Loading parents..." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Child</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parents.map((parent) => (
                  <tr key={parent._id}>
                    <td>{parent.parentName}</td>
                    <td>{parent.email}</td>
                    <td>{parent.phone || '-'}</td>
                    <td>{parent.childId?.studentName || '-'}</td>
                    <td>
                      <button className="text-link" type="button" onClick={() => viewParent(parent)}>View</button>
                      <button className="text-link" type="button" onClick={() => editParent(parent)}>Edit</button>
                      <button className="text-link" type="button" onClick={() => deleteParent(parent)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default ParentsPage;
