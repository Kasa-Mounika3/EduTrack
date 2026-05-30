import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import api, { getApiError } from '../services/api.js';
import { resolveAssetUrl } from '../utils/assets.js';

const Parents = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const viewParent = (parent) => {
    const displayName = parent.name || parent.parentName || 'Parent';
    const children = (parent.children?.length ? parent.children : parent.linkedStudents || []).map((student) => student.studentName || student.name).join(', ') || 'None linked';
    window.alert(`${displayName}\n${parent.email}\nPhone: ${parent.phone || 'Not added'}\nStudents: ${children}`);
  };
  const editParent = async (parent) => {
    const name = window.prompt('Parent name', parent.name || parent.parentName);
    if (!name) return;
    const phone = window.prompt('Phone', parent.phone || '') ?? parent.phone;
    await api.put(`/parents/${parent._id}`, { name, phone });
    loadParents();
  };

  const loadParents = () => {
    setLoading(true);
    api.get('/parents', { params: { limit: 50 } })
      .then((response) => setParents(response.data.data || []))
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadParents();

    const handleDirectoryUpdate = (event) => {
      if (event.detail?.type?.includes('parent')) loadParents();
    };

    window.addEventListener('edutrack:dashboard-update', handleDirectoryUpdate);
    return () => window.removeEventListener('edutrack:dashboard-update', handleDirectoryUpdate);
  }, []);

  return (
    <section className="page">
      <PageHeader
        eyebrow="Parents"
        title="Parent Directory"
        description="Review guardian profiles and linked student records."
      />
      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <Loader text="Loading parents..." />
      ) : (
        <div className="card-grid">
          {parents.map((parent) => {
            const displayName = parent.name || parent.parentName || 'Parent';
            const photo = resolveAssetUrl(parent.profilePhoto || '');
            const linkedStudents = parent.children?.length ? parent.children : parent.linkedStudents || [];
            return (
            <article className="student-card" key={parent._id}>
              <div className="avatar" aria-hidden="true">
                {photo ? <img src={photo} alt={displayName} /> : displayName.charAt(0)}
              </div>
              <h3>{displayName}</h3>
              <p>{parent.email}</p>
              <dl>
                <div><dt>Parent ID</dt><dd>{parent.parentId || parent._id}</dd></div>
                <div><dt>Phone</dt><dd>{parent.phone || 'Not added'}</dd></div>
                <div><dt>Relationship</dt><dd>{parent.relationship || 'Guardian'}</dd></div>
                <div><dt>Linked Students</dt><dd>{linkedStudents.map((student) => student.studentName || student.name).join(', ') || 'None'}</dd></div>
              </dl>
              <div className="detail-actions">
                <button className="ghost-link" type="button" onClick={() => viewParent(parent)}>View</button>
                <button className="ghost-link" type="button" onClick={() => editParent(parent)}>Edit</button>
                <button
                  className="ghost-link text-red-600"
                  type="button"
                  onClick={async () => {
                    await api.delete(`/parents/${parent._id}`);
                    loadParents();
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

export default Parents;
