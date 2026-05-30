import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { studentService } from '../services/studentService.js';
import { getApiError } from '../services/api.js';

const Progress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allLearners, setAllLearners] = useState([]);
  const [selectedLearnerId, setSelectedLearnerId] = useState('');

  const calculateGrade = (score) => {
    const num = Number(score);
    if (isNaN(num)) return 'F';
    if (num >= 90) return 'A+';
    if (num >= 80) return 'A';
    if (num >= 70) return 'B';
    if (num >= 60) return 'C';
    if (num >= 50) return 'D';
    return 'F';
  };

  useEffect(() => {
    const loadLearners = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await studentService.list({ limit: 100 });
        setAllLearners(res.students || []);
        if (res.students?.length > 0) {
          setSelectedLearnerId(res.students[0]._id);
        }
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    loadLearners();
  }, []);

  const activeLearner = allLearners.find((l) => l._id === selectedLearnerId);
  const subjectGrades = activeLearner?.subjectGrades || [];

  // Metrics
  const avgAttendance = activeLearner?.attendance ?? 0;
  const avgMarks = activeLearner?.marks ?? 0;
  const overallGrade = calculateGrade(avgMarks);

  if (loading) {
    return (
      <section className="section-grid">
        <PageHeader eyebrow="Analytics" title="Progress Report" description="Loading tracking metrics..." />
        <Skeleton rows={4} />
      </section>
    );
  }

  return (
    <section className="section-grid">
      <PageHeader
        eyebrow="Student Reports"
        title="Academic Progress"
        description="Comprehensive dashboard displaying performance indicators, overall averages, and subject grading."
      />

      {error && <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}

      {user.role === 'parent' && allLearners.length > 0 && (
        <div className="panel flex items-center justify-between gap-4">
          <label className="label w-fit" style={{ margin: 0 }}>
            Select Child:
            <select value={selectedLearnerId} onChange={(e) => setSelectedLearnerId(e.target.value)} style={{ minWidth: '220px', marginTop: '6px' }}>
              {allLearners.map((l) => (
                <option key={l._id} value={l._id}>{l.studentName || l.name}</option>
              ))}
            </select>
          </label>
          <div className="count-pill">
            {allLearners.length} Linked Child Record(s)
          </div>
        </div>
      )}

      {!activeLearner ? (
        <EmptyState title="No records found" message="No student records are linked to your profile." />
      ) : (
        <div className="grid gap-4">
          {/* Top Level Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <article className="panel" style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', textAlign: 'center' }}>
              <span className="muted text-sm font-bold uppercase tracking-wider">Overall Attendance</span>
              <strong style={{ fontSize: '3rem', margin: '14px 0', color: avgAttendance >= 75 ? 'var(--accent)' : 'var(--danger)' }}>{avgAttendance}%</strong>
              <div className="progress-track" style={{ height: '8px' }}>
                <div className="progress-fill" style={{ width: `${avgAttendance}%`, backgroundColor: avgAttendance >= 75 ? 'var(--accent)' : 'var(--danger)' }}></div>
              </div>
              <p className="muted text-xs mt-3">Target threshold: 75% minimum attendance</p>
            </article>

            <article className="panel" style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', textAlign: 'center' }}>
              <span className="muted text-sm font-bold uppercase tracking-wider">Average Marks</span>
              <strong style={{ fontSize: '3rem', margin: '14px 0', color: 'var(--primary)' }}>{avgMarks}/100</strong>
              <div className="progress-track" style={{ height: '8px' }}>
                <div className="progress-fill" style={{ width: `${avgMarks}%`, backgroundColor: 'var(--primary)' }}></div>
              </div>
              <p className="muted text-xs mt-3">Across all registered assessment grades</p>
            </article>

            <article className="panel" style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', textAlign: 'center' }}>
              <span className="muted text-sm font-bold uppercase tracking-wider">Academic Standing</span>
              <strong style={{ fontSize: '3rem', margin: '14px 0', color: overallGrade === 'F' ? 'var(--danger)' : '#1e3a8a' }}>{overallGrade}</strong>
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 py-1 font-bold text-sm">
                Cumulative Grade Value
              </div>
              <p className="muted text-xs mt-3">Reflects averages of published grades</p>
            </article>
          </div>

          {/* Academic Info */}
          <article className="panel">
            <div className="panel-heading" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <h2>Student Directory Context</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
              <div>
                <span className="muted text-xs block font-bold">Course Program</span>
                <strong className="block mt-1">{activeLearner.course?.courseName || 'Unassigned'}</strong>
              </div>
              <div>
                <span className="muted text-xs block font-bold">Class Section</span>
                <strong className="block mt-1">Section {activeLearner.sectionId?.sectionName || 'N/A'}</strong>
              </div>
              <div>
                <span className="muted text-xs block font-bold">Academic Year</span>
                <strong className="block mt-1">{activeLearner.year || 'General'}</strong>
              </div>
              <div>
                <span className="muted text-xs block font-bold">Department</span>
                <strong className="block mt-1">{activeLearner.departmentId?.departmentName || 'General'}</strong>
              </div>
            </div>
          </article>

          {/* Subject Cards breakdown */}
          <article className="panel">
            <div className="panel-heading mb-4">
              <h2>Subject Breakdown Reports</h2>
            </div>

            {subjectGrades.length === 0 ? (
              <EmptyState title="No subjects mapped" message="Academic subject listings appear here once final rosters are published by teachers." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {subjectGrades.map((g) => {
                  const sub = g.subjectId || {};
                  const isPublished = g.resultPublished;
                  const score = g.marks ?? 0;
                  const att = g.attendance ?? 0;

                  return (
                    <div key={g._id || sub._id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-900" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="count-pill">{sub.subjectCode || 'SUB'}</span>
                        <span className="font-bold text-xs" style={{ color: isPublished ? 'var(--accent)' : '#b45309' }}>
                          {isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <h3 className="font-black text-lg mt-1">{sub.subjectName || 'Course Subject'}</h3>
                      <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '8px 0 0' }}>
                        <div>
                          <dt className="muted text-xs font-bold">Attendance</dt>
                          <dd style={{ fontSize: '1.1rem', color: att >= 75 ? 'var(--accent)' : 'var(--danger)' }}>{att}%</dd>
                        </div>
                        <div>
                          <dt className="muted text-xs font-bold">Marks & Grade</dt>
                          <dd style={{ fontSize: '1.1rem' }}>
                            {isPublished ? `${score}/100 (${calculateGrade(score)})` : 'Pending'}
                          </dd>
                        </div>
                      </dl>
                      {isPublished && g.remarks && (
                        <div className="mt-2 text-xs border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-600 dark:text-slate-400">
                          <strong>Teacher feedback:</strong> "{g.remarks}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        </div>
      )}
    </section>
  );
};

export default Progress;
