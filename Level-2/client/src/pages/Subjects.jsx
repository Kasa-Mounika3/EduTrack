import { useEffect, useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Modal from '../components/Modal.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useCourses } from '../hooks/useCourses.js';
import api, { getApiErrorMessage as getApiError } from '../services/apiClient.js';
import { academicService } from '../services/academicService.js';

const emptySubject = { subjectName: '', subjectCode: '', course: '', department: '', year: '', section: '', teacher: '' };
const yearsList = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const Subjects = () => {
  const { courses, fetchCourses } = useCourses();
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptySubject);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await academicService.list();
      setSubjects(data.subjects || []);
      setDepartments(data.departments || []);
      setSections(data.sections || []);

      const teacherRes = await api.get('/teachers', { params: { limit: 100 } });
      setTeachers(teacherRes.data.data || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchCourses();
  }, [fetchCourses]);

  // Filters for dynamic cascading selects
  const filteredDepartments = useMemo(() => {
    if (!form.course) return [];
    return departments.filter(d => d.course?._id === form.course || d.course === form.course);
  }, [form.course, departments]);

  const filteredSections = useMemo(() => {
    if (!form.course || !form.department || !form.year) return [];
    return sections.filter(s => {
      const isCourseMatch = s.course?._id === form.course || s.course === form.course;
      const isDeptMatch = s.department?._id === form.department || s.department === form.department;
      const isYearMatch = s.year === form.year;
      return isCourseMatch && isDeptMatch && isYearMatch;
    });
  }, [form.course, form.department, form.year, sections]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await academicService.createSubject(form);
      setForm(emptySubject);
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-grid">
      <PageHeader
        eyebrow="Academics"
        title="Subjects"
        description="Configure specific lecture courses, curricula, and teacher assignments."
        action={<button className="btn-primary" type="button" onClick={() => setShowModal(true)}>Add Subject</button>}
      />

      {error && <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}

      {loading ? (
        <Skeleton rows={4} />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="No subjects found"
          message="Create a subject to assign instructors and students to classes."
          action={<button className="btn-primary" type="button" onClick={() => setShowModal(true)}>Add Subject</button>}
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Subject Code</th>
                <th>Year & Section</th>
                <th>Department</th>
                <th>Assigned Teacher</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => (
                <tr key={sub._id}>
                  <td><strong>{sub.subjectName}</strong></td>
                  <td><span className="count-pill">{sub.subjectCode}</span></td>
                  <td>{sub.year || 'All Years'} - Section {sub.section?.sectionName || 'General'}</td>
                  <td>{sub.department?.departmentName || 'General'}</td>
                  <td>
                    {sub.teacher ? (
                      <div>
                        <strong>{sub.teacher.name || sub.teacher.teacherName}</strong>
                        <small className="table-id">{sub.teacher.email}</small>
                      </div>
                    ) : (
                      <em className="muted">Not assigned</em>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showModal} title="Add Subject & Assign Teacher" onClose={() => setShowModal(false)}>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="label">
              Subject Name
              <input required className="input" value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} placeholder="e.g. Operating Systems" />
            </label>
            <label className="label">
              Subject Code
              <input required className="input" value={form.subjectCode} onChange={(e) => setForm({ ...form, subjectCode: e.target.value })} placeholder="e.g. CS-301" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="label">
              Course Link
              <select required value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value, department: '', section: '' })}>
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.courseName} ({course.courseCode})</option>
                ))}
              </select>
            </label>
            <label className="label">
              Department Link
              <select required disabled={!form.course} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value, section: '' })}>
                <option value="">Select department</option>
                {filteredDepartments.map((dept) => (
                  <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                ))}
              </select>
            </label>
            <label className="label">
              Academic Year
              <select required value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value, section: '' })}>
                <option value="">Select year</option>
                {yearsList.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="label">
              Class Section Link
              <select required disabled={!form.year || !form.department} value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                <option value="">Select class section</option>
                {filteredSections.map((sec) => (
                  <option key={sec._id} value={sec._id}>Section {sec.sectionName}</option>
                ))}
              </select>
            </label>
            <label className="label">
              Assign Teacher
              <select required value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}>
                <option value="">Select teacher to assign</option>
                {teachers.map((teach) => (
                  <option key={teach._id} value={teach._id}>{teach.name || teach.teacherName} ({teach.email})</option>
                ))}
              </select>
            </label>
          </div>

          <button className="btn-primary w-fit" disabled={saving}>{saving ? 'Saving...' : 'Add Subject'}</button>
        </form>
      </Modal>
    </section>
  );
};

export default Subjects;


