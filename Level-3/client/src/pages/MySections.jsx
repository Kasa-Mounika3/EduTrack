import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { dashboardService } from '../services/dashboardService.js';
import { getApiError } from '../services/api.js';

const MySections = () => {
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

  const assignedSections = summary?.teacherProfile?.assignedSections || [];

  return (
    <section className="section-grid">
      <PageHeader
        eyebrow="Teacher Workspace"
        title="My Assigned Sections"
        description="View class groups, academic years, and departments assigned to your teaching profile."
      />

      {error && <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}

      {loading ? (
        <Skeleton rows={4} />
      ) : assignedSections.length === 0 ? (
        <EmptyState
          title="No assigned sections"
          message="You have not been assigned to teach any class sections yet. Contact the Administrator for profile mappings."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assignedSections.map((sec) => (
            <article className="panel" key={sec._id}>
              <span className="count-pill">Section {sec.sectionName}</span>
              <h3 className="mt-4 text-xl font-black">{sec.year}</h3>
              <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="muted text-sm font-bold">Department</p>
                <strong>{sec.department?.departmentName || 'General Program'}</strong>
              </div>
              <div className="mt-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="muted text-sm font-bold">Course Group</p>
                <strong>{sec.course?.courseName || 'Linked Course'}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default MySections;
