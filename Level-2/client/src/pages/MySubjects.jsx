import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { dashboardService } from '../services/dashboardService.js';
import { getApiErrorMessage as getApiError } from '../services/apiClient.js';

const MySubjects = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
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
    loadData();
  }, []);

  const assignedSubjects = summary?.teacherProfile?.assignedSubjects || [];

  return (
    <section className="section-grid">
      <PageHeader
        eyebrow="Teacher Workspace"
        title="My Assigned Subjects"
        description="View specific courses and curricula assigned to your teaching profile."
      />

      {error && <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}

      {loading ? (
        <Skeleton rows={4} />
      ) : assignedSubjects.length === 0 ? (
        <EmptyState
          title="No assigned subjects"
          message="You have not been assigned to teach any subjects yet. Contact the Administrator for profile mappings."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assignedSubjects.map((sub) => (
            <article className="panel" key={sub._id}>
              <span className="count-pill">{sub.subjectCode}</span>
              <h3 className="mt-4 text-xl font-black">{sub.subjectName}</h3>
              <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="muted text-sm font-bold">Target Year</p>
                <strong>{sub.year || 'All Years'}</strong>
              </div>
              <div className="mt-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="muted text-sm font-bold">Course Group</p>
                <strong>{sub.course?.courseName || 'Linked Course'}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default MySubjects;

