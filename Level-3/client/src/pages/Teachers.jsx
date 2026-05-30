import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import api, { getApiError } from '../services/api.js';
import { resolveAssetUrl } from '../utils/assets.js';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const viewTeacher = (teacher) => {
    const displayName = teacher.name || teacher.teacherName || 'Teacher';
    window.alert(`${displayName}\n${teacher.email}\nDepartment: ${teacher.departmentId?.departmentName || teacher.department || 'Not assigned'}`);
  };
  const editTeacher = async (teacher) => {
    const name = window.prompt('Teacher name', teacher.name || teacher.teacherName);
    if (!name) return;
    const department = window.prompt('Department', teacher.department || teacher.departmentId?.departmentName || '') ?? teacher.department;
    await api.put(`/teachers/${teacher._id}`, { name, department });
    loadTeachers();
  };

  const loadTeachers = () => {
    setLoading(true);
    api.get('/teachers', { params: { limit: 50 } })
      .then((response) => setTeachers(response.data.data || []))
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTeachers();

    const handleDirectoryUpdate = (event) => {
      if (event.detail?.type?.includes('teacher')) loadTeachers();
    };

    window.addEventListener('edutrack:dashboard-update', handleDirectoryUpdate);
    return () => window.removeEventListener('edutrack:dashboard-update', handleDirectoryUpdate);
  }, []);

  return (
    <section className="page">
      <PageHeader
        eyebrow="Teachers"
        title="Teacher Directory"
        description="Manage faculty profiles, departments, subjects, and assigned sections."
      />
      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <Loader text="Loading teachers..." />
      ) : (
        <div className="card-grid">
          {teachers.map((teacher) => {
            const displayName = teacher.name || teacher.teacherName || 'Teacher';
            const photo = resolveAssetUrl(teacher.profilePhoto || '');
            return (
            <article className="student-card" key={teacher._id}>
              <div className="avatar" aria-hidden="true">
                {photo ? <img src={photo} alt={displayName} /> : displayName.charAt(0)}
              </div>
              <h3>{displayName}</h3>
              <p>{teacher.email}</p>
              <dl>
                <div><dt>Teacher ID</dt><dd>{teacher.teacherId || 'Not assigned'}</dd></div>
                <div><dt>Department</dt><dd>{teacher.departmentId?.departmentName || teacher.department || 'Not assigned'}</dd></div>
                <div><dt>Assigned Sections</dt><dd>{teacher.assignedSections?.map((section) => `${section.year} ${section.sectionName}`).join(', ') || 'None'}</dd></div>
                <div><dt>Assigned Subjects</dt><dd>{teacher.assignedSubjects?.map((subject) => subject.subjectName || subject.subjectCode).join(', ') || teacher.subjects?.join(', ') || 'None'}</dd></div>
              </dl>
              <div className="detail-actions">
                <button className="ghost-link" type="button" onClick={() => viewTeacher(teacher)}>View</button>
                <button className="ghost-link" type="button" onClick={() => editTeacher(teacher)}>Edit</button>
                <button
                  className="ghost-link text-red-600"
                  type="button"
                  onClick={async () => {
                    await api.delete(`/teachers/${teacher._id}`);
                    loadTeachers();
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Teachers;
