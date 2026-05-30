import { useEffect, useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Modal from '../components/Modal.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useCourses } from '../hooks/useCourses.js';
import { academicService } from '../services/academicService.js';
import { getApiErrorMessage as getApiError } from '../services/apiClient.js';

const emptySection = { sectionName: '', year: '', course: '', department: '' };
const yearsList = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const Sections = () => {
  const { courses, fetchCourses } = useCourses();
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptySection);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await academicService.list();
      setSections(data.sections || []);
      setDepartments(data.departments || []);
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

  // Premium filtering: only show departments belonging to the selected course
  const filteredDepartments = useMemo(() => {
    if (!form.course) return [];
    return departments.filter(d => d.course?._id === form.course || d.course === form.course);
  }, [form.course, departments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await academicService.createSection(form);
      setForm(emptySection);
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
        title="Sections"
        description="Organize class groups and student enrollment sections."
        action={<button className="btn-primary" type="button" onClick={() => setShowModal(true)}>Add Section</button>}
      />

      {error && <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}

      {loading ? (
        <Skeleton rows={4} />
      ) : sections.length === 0 ? (
        <EmptyState
          title="No sections found"
          message="Create a section to group students in specific years and departments."
          action={<button className="btn-primary" type="button" onClick={() => setShowModal(true)}>Add Section</button>}
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Section</th>
                <th>Year</th>
                <th>Department</th>
                <th>Course</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((sec) => (
                <tr key={sec._id}>
                  <td><strong>Section {sec.sectionName}</strong></td>
                  <td>{sec.year}</td>
                  <td>{sec.department?.departmentName || 'General'}</td>
                  <td>{sec.course?.courseName || 'Linked Course'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showModal} title="Add Section" onClose={() => setShowModal(false)}>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="label">
            Section Name
            <input required className="input" value={form.sectionName} onChange={(e) => setForm({ ...form, sectionName: e.target.value })} placeholder="e.g. A, B, C" />
          </label>
          <label className="label">
            Academic Year
            <select required value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
              <option value="">Select year</option>
              {yearsList.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
          <label className="label">
            Course Link
            <select required value={form.course} onChange={(e) => { setForm({ ...form, course: e.target.value, department: '' }); }}>
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.courseName} ({course.courseCode})</option>
              ))}
            </select>
          </label>
          <label className="label">
            Department Link
            <select required disabled={!form.course} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              <option value="">Select department</option>
              {filteredDepartments.map((dept) => (
                <option key={dept._id} value={dept._id}>{dept.departmentName} ({dept.departmentCode})</option>
              ))}
            </select>
          </label>
          <button className="btn-primary w-fit" disabled={saving}>{saving ? 'Saving...' : 'Add Section'}</button>
        </form>
      </Modal>
    </section>
  );
};

export default Sections;


