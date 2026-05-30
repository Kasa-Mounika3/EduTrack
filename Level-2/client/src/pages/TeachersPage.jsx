import { useEffect, useState } from 'react';
import Loader from '../components/Loader.jsx';
import { getApiErrorMessage, teacherService } from '../services/teacherService.js';
import { studentService } from '../services/studentService.js';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    teacherName: '',
    email: '',
    subject: '',
    password: '',
    assignedStudents: []
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [teacherData, studentResult] = await Promise.all([
        teacherService.getTeachers(),
        studentService.getStudents({ limit: 100 })
      ]);
      setTeachers(teacherData);
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

  const handleChange = (event) => {
    const { name, value, selectedOptions } = event.target;

    if (name === 'assignedStudents') {
      setFormData((current) => ({
        ...current,
        assignedStudents: Array.from(selectedOptions).map((option) => option.value)
      }));
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = new FormData();
      Object.entries({ ...formData, password: formData.password || undefined }).forEach(([key, value]) => {
        if (Array.isArray(value)) value.forEach((item) => payload.append(key, item));
        else if (value !== undefined && value !== '') payload.append(key, value);
      });
      if (photoFile) payload.append('profilePhoto', photoFile);
      const result = await teacherService.createTeacher(payload);
      setCredentials(result.loginCredentials);
      setFormData({ teacherName: '', email: '', subject: '', password: '', assignedStudents: [] });
      setPhotoFile(null);
      setPhotoPreview('');
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const viewTeacher = (teacher) => {
    window.alert(`${teacher.teacherName}\n${teacher.email}\nSubject: ${teacher.subject || 'Not assigned'}`);
  };

  const editTeacher = async (teacher) => {
    const teacherName = window.prompt('Teacher name', teacher.teacherName);
    if (!teacherName) return;
    const subject = window.prompt('Subject', teacher.subject || '') ?? teacher.subject;
    await teacherService.updateTeacher(teacher._id, { teacherName, subject });
    await loadData();
  };

  const deleteTeacher = async (teacher) => {
    if (!window.confirm(`Delete ${teacher.teacherName}?`)) return;
    await teacherService.deleteTeacher(teacher._id);
    await loadData();
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Teachers</h1>
          <p>Create teacher login accounts and assign students for progress tracking.</p>
        </div>
        <div className="count-pill">{teachers.length} teachers</div>
      </div>

      {credentials && (
        <div className="notification">
          Teacher login created: {credentials.email} / {credentials.temporaryPassword}
        </div>
      )}
      {error && <div className="alert error">{error}</div>}

      <div className="panel spaced-panel">
        <div className="panel-heading">
          <h2>Add Teacher</h2>
        </div>
        <form className="student-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <span>Profile Photo</span>
              <div className="details-card">
                <div className="avatar large-avatar" aria-hidden="true">
                  {photoPreview ? <img src={photoPreview} alt={formData.teacherName || 'Teacher'} /> : (formData.teacherName || 'T').charAt(0)}
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
              <input name="teacherName" value={formData.teacherName} onChange={handleChange} required />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required />
            </label>
            <label>
              <span>Subject</span>
              <input name="subject" value={formData.subject} onChange={handleChange} required />
            </label>
            <label>
              <span>Password</span>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to auto-generate"
              />
            </label>
            <label>
              <span>Assigned Students</span>
              <select
                name="assignedStudents"
                multiple
                value={formData.assignedStudents}
                onChange={handleChange}
              >
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.studentName}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="primary-button" type="submit">
            Create Teacher
          </button>
        </form>
      </div>

      <div className="panel">
        {loading ? (
          <Loader text="Loading teachers..." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Assigned Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher._id}>
                    <td>{teacher.teacherName}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.subject}</td>
                    <td>{teacher.assignedStudents?.length || 0}</td>
                    <td>
                      <button className="text-link" type="button" onClick={() => viewTeacher(teacher)}>View</button>
                      <button className="text-link" type="button" onClick={() => editTeacher(teacher)}>Edit</button>
                      <button className="text-link" type="button" onClick={() => deleteTeacher(teacher)}>Delete</button>
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

export default TeachersPage;
