import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { studentService } from '../services/studentService.js';
import { dashboardService } from '../services/dashboardService.js';
import { getApiErrorMessage as getApiError } from '../services/apiClient.js';

const Marks = () => {
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
  const [assessment, setAssessment] = useState('Final Exam');
  const [studentsList, setStudentsList] = useState([]);
  const [gradesMap, setGradesMap] = useState({}); // { studentId: { marks: 0, remarks: '', resultPublished: false } }

  // Student & Parent State
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
        const matching = (res.students || []).filter(
          (s) => s.sectionId?._id === selectedSection || s.sectionId === selectedSection
        );
        setStudentsList(matching);

        // Pre-populate grades map with existing values or defaults
        const initialMap = {};
        matching.forEach((s) => {
          const existingGrade = s.subjectGrades?.find(
            (g) => g.subjectId?._id === selectedSubject || g.subjectId === selectedSubject
          );
          initialMap[s._id] = {
            marks: existingGrade?.marks !== undefined ? existingGrade.marks : 0,
            remarks: existingGrade?.remarks || '',
            resultPublished: existingGrade?.resultPublished !== undefined ? existingGrade.resultPublished : false
          };
        });
        setGradesMap(initialMap);
      } catch (err) {
        setError(getApiError(err));
      }
    };

    fetchClassStudents();
  }, [selectedSection, selectedSubject, user]);

  const handleGradeChange = (studentId, field, val) => {
    setGradesMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val
      }
    }));
  };

  const handleSaveGrades = async (e) => {
    e.preventDefault();
    if (!selectedSubject || !selectedSection) {
      setError('Please select Subject and Section before saving.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await Promise.all(
        studentsList.map((s) => {
          const data = gradesMap[s._id] || { marks: 0, remarks: '', resultPublished: false };
          return studentService.updateGrades(s._id, {
            subjectId: selectedSubject,
            marks: Number(data.marks),
            remarks: data.remarks,
            resultPublished: data.resultPublished
          });
        })
      );
      setSuccess('Academic grades register updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const activeLearner = allLearners.find((l) => l._id === selectedLearnerId);
  const subjectGrades = activeLearner?.subjectGrades || [];

  if (loading) {
    return (
      <section className="section-grid">
        <PageHeader eyebrow="Academics" title="Grade Book" description="Loading portal data..." />
        <Skeleton rows={4} />
      </section>
    );
  }

  return (
    <section className="section-grid">
      <PageHeader
        eyebrow={user.role === 'teacher' ? 'Teacher Workspace' : 'My Records'}
        title="Marks & Assessments"
        description={
          user.role === 'teacher'
            ? 'Enter scores, assign virtual letter grades, and publish results.'
            : 'Review academic grades, scores, and teacher remarks.'
        }
      />

      {error && <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}
      {success && <div className="rounded-xl bg-emerald-50 p-3 font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{success}</div>}

      {/* TEACHER WORKFLOW */}
      {user.role === 'teacher' && (
        <form onSubmit={handleSaveGrades} className="grid gap-4">
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
              Assessment Name
              <input required type="text" value={assessment} onChange={(e) => setAssessment(e.target.value)} />
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
                      <th style={{ width: '25%' }}>Student</th>
                      <th style={{ width: '15%' }}>Score (0-100)</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>Grade</th>
                      <th style={{ width: '35%' }}>Teacher Remarks</th>
                      <th style={{ width: '15%', textAlign: 'center' }}>Publish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsList.map((s) => {
                      const data = gradesMap[s._id] || { marks: 0, remarks: '', resultPublished: false };
                      return (
                        <tr key={s._id}>
                          <td>
                            <strong>{s.studentName || s.name}</strong>
                            <small className="table-id">{s.email}</small>
                          </td>
                          <td>
                            <input required type="number" min="0" max="100" className="input" value={data.marks} onChange={(e) => handleGradeChange(s._id, 'marks', e.target.value)} style={{ padding: '6px 8px', minHeight: 'auto' }} />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="count-pill font-black" style={{ display: 'inline-block', minWidth: '40px' }}>
                              {calculateGrade(data.marks)}
                            </span>
                          </td>
                          <td>
                            <input type="text" className="input" value={data.remarks} onChange={(e) => handleGradeChange(s._id, 'remarks', e.target.value)} placeholder="Enter performance feedback" style={{ padding: '6px 8px', minHeight: 'auto' }} />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={data.resultPublished} onChange={(e) => handleGradeChange(s._id, 'resultPublished', e.target.checked)} style={{ width: '20px', height: '20px', margin: '0 auto', cursor: 'pointer' }} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button className="btn-primary" disabled={saving}>{saving ? 'Saving marks...' : 'Save Grades'}</button>
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
            <EmptyState title="No grades published" message="Subject grades will appear here once classroom instructors publish final scores." />
          ) : (
            <div className="table-wrap panel" style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Subject Code</th>
                    <th>Teacher</th>
                    <th style={{ textAlign: 'center' }}>Score</th>
                    <th style={{ textAlign: 'center' }}>Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectGrades.map((g) => {
                    const sub = g.subjectId || {};
                    const teachName = sub.teacher?.name || sub.teacher?.teacherName || 'Faculty pending';
                    const isPublished = g.resultPublished;

                    return (
                      <tr key={g._id || sub._id}>
                        <td><strong>{sub.subjectName || 'Course Subject'}</strong></td>
                        <td><span className="count-pill">{sub.subjectCode || 'SUB'}</span></td>
                        <td>{teachName}</td>
                        <td style={{ textAlign: 'center' }}>
                          {isPublished ? (
                            <strong style={{ fontSize: '1.1rem' }}>{g.marks ?? 0}</strong>
                          ) : (
                            <em className="muted text-sm">Pending</em>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isPublished ? (
                            <span className="count-pill font-black text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-200" style={{ padding: '4px 10px' }}>
                              {calculateGrade(g.marks)}
                            </span>
                          ) : (
                            <span className="count-pill font-bold text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-200" style={{ padding: '4px 10px' }}>
                              Draft
                            </span>
                          )}
                        </td>
                        <td>
                          {isPublished ? (
                            <span>{g.remarks || 'No remarks provided.'}</span>
                          ) : (
                            <span className="muted italic">Assessment pending final review.</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Marks;

