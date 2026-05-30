import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { studentService } from '../services/studentService.js';
import { dashboardService } from '../services/dashboardService.js';
import { getApiError } from '../services/api.js';

const Attendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Teacher State
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [assignedSections, setAssignedSections] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentsList, setStudentsList] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: 100/50/0 }

  // Student & Parent State
  const [allLearners, setAllLearners] = useState([]);
  const [selectedLearnerId, setSelectedLearnerId] = useState('');

  const loadTeacherSetup = async () => {
    try {
      const summary = await dashboardService.summary();
      const profile = summary?.teacherProfile;
      setAssignedSubjects(profile?.assignedSubjects || []);
      setAssignedSections(profile?.assignedSections || []);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const loadStudentOrParentData = async () => {
    try {
      const res = await studentService.list({ limit: 100 });
      setAllLearners(res.students || []);
      if (res.students?.length > 0) {
        setSelectedLearnerId(res.students[0]._id);
      }
    } catch (err) {
      setError(getApiError(err));
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      if (user.role === 'teacher') {
        await loadTeacherSetup();
      } else {
        await loadStudentOrParentData();
      }
      setLoading(false);
    };
    init();
  }, [user]);

  // Fetch students for selected section (Teacher only)
  useEffect(() => {
    if (user.role !== 'teacher' || !selectedSection) {
      setStudentsList([]);
      return;
    }

    const fetchClassStudents = async () => {
      setError('');
      try {
        const res = await studentService.list({ limit: 200 });
        // Filter students belonging to the selected section
        const matching = (res.students || []).filter(
          (s) => s.sectionId?._id === selectedSection || s.sectionId === selectedSection
        );
        setStudentsList(matching);

        // Pre-populate attendance map with 100 (Present) for each student
        const initialMap = {};
        matching.forEach((s) => {
          const existingGrade = s.subjectGrades?.find(
            (g) => g.subjectId?._id === selectedSubject || g.subjectId === selectedSubject
          );
          initialMap[s._id] = existingGrade?.attendance !== undefined ? existingGrade.attendance : 100;
        });
        setAttendanceMap(initialMap);
      } catch (err) {
        setError(getApiError(err));
      }
    };

    fetchClassStudents();
  }, [selectedSection, selectedSubject, user]);

  const handleStatusChange = (studentId, statusValue) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: Number(statusValue)
    }));
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (!selectedSubject || !selectedSection) {
      setError('Please select Subject and Section before saving.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Send individual update request for each student in the grid
      await Promise.all(
        studentsList.map((s) =>
          studentService.updateAttendance(s._id, attendanceMap[s._id] || 100, selectedSubject)
        )
      );
      setSuccess('Attendance register updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  // Resolve selected student's subject-wise attendance (Student/Parent only)
  const activeLearner = allLearners.find((l) => l._id === selectedLearnerId);
  const subjectGrades = activeLearner?.subjectGrades || [];

  if (loading) {
    return (
      <section className="section-grid">
        <PageHeader eyebrow="Academics" title="Attendance Log" description="Loading portal data..." />
        <Skeleton rows={4} />
      </section>
    );
  }

  return (
    <section className="section-grid">
      <PageHeader
        eyebrow={user.role === 'teacher' ? 'Teacher Workspace' : 'My Records'}
        title="Attendance Management"
        description={
          user.role === 'teacher'
            ? 'Mark and edit daily classroom attendance grids.'
            : 'Review subject-wise academic attendance percentages.'
        }
      />

      {error && <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}
      {success && <div className="rounded-xl bg-emerald-50 p-3 font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{success}</div>}

      {/* TEACHER WORKFLOW */}
      {user.role === 'teacher' && (
        <form onSubmit={handleSaveAttendance} className="grid gap-4">
          <div className="panel grid gap-4 md:grid-cols-3">
            <label className="label">
              Subject
              <select required value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                <option value="">Select subject</option>
                {assignedSubjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.subjectName} ({sub.subjectCode})</option>
                ))}
              </select>
            </label>
            <label className="label">
              Section
              <select required value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                <option value="">Select section</option>
                {assignedSections.map((sec) => (
                  <option key={sec._id} value={sec._id}>{sec.year} - Section {sec.sectionName}</option>
                ))}
              </select>
            </label>
            <label className="label">
              Date
              <input required type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </label>
          </div>

          {!selectedSection ? (
            <EmptyState title="No section selected" message="Select a subject and section from the filters to load class students." />
          ) : studentsList.length === 0 ? (
            <EmptyState title="No students found" message="No student profiles are enrolled in this class section yet." />
          ) : (
            <div className="panel">
              <div className="table-wrap mb-4">
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th style={{ textAlign: 'center' }}>Mark Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsList.map((s) => {
                      const val = attendanceMap[s._id] !== undefined ? attendanceMap[s._id] : 100;
                      return (
                        <tr key={s._id}>
                          <td><strong>{s.studentName || s.name}</strong></td>
                          <td className="muted">{s.email}</td>
                          <td style={{ display: 'flex', justifyContent: 'center', gap: '16px', borderBottom: 0 }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                              <input type="radio" name={`att-${s._id}`} checked={val === 100} onChange={() => handleStatusChange(s._id, 100)} style={{ width: 'auto', minHeight: 'auto' }} />
                              Present
                            </label>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', cursor: 'pointer', color: 'var(--danger)' }}>
                              <input type="radio" name={`att-${s._id}`} checked={val === 0} onChange={() => handleStatusChange(s._id, 0)} style={{ width: 'auto', minHeight: 'auto' }} />
                              Absent
                            </label>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', cursor: 'pointer', color: '#b45309' }}>
                              <input type="radio" name={`att-${s._id}`} checked={val === 50} onChange={() => handleStatusChange(s._id, 50)} style={{ width: 'auto', minHeight: 'auto' }} />
                              Late
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button className="btn-primary" disabled={saving}>{saving ? 'Saving attendance...' : 'Save Attendance'}</button>
            </div>
          )}
        </form>
      )}

      {/* STUDENT & PARENT WORKFLOW */}
      {user.role !== 'teacher' && (
        <div className="grid gap-4">
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
            <EmptyState title="No records found" message="No student records are linked to your account." />
          ) : subjectGrades.length === 0 ? (
            <EmptyState title="No attendance logged" message="Attendance averages appear here once your instructors publish classroom reports." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjectGrades.map((g) => {
                const sub = g.subjectId || {};
                const teachName = sub.teacher?.name || sub.teacher?.teacherName || 'Faculty pending';
                const rate = g.attendance ?? 0;
                const color = rate >= 75 ? 'var(--accent)' : 'var(--danger)';
                return (
                  <article className="panel" key={g._id || sub._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="count-pill">{sub.subjectCode || 'SUB'}</span>
                      <strong style={{ fontSize: '1.5rem', color }}>{rate}%</strong>
                    </div>
                    <h3 className="mt-4 text-lg font-black">{sub.subjectName || 'Course Subject'}</h3>
                    <p className="muted text-sm mt-2">Instructor: <strong>{teachName}</strong></p>

                    <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-2 rounded-full" style={{ width: `${rate}%`, backgroundColor: color }}></div>
                    </div>
                    <small className="block mt-2 font-bold" style={{ color }}>
                      {rate >= 75 ? 'Good Standing' : 'Below Attendance Limit (75%)'}
                    </small>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Attendance;
