import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Modal from '../components/Modal.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useCourses } from '../hooks/useCourses.js';
import { academicService } from '../services/academicService.js';
import { getApiErrorMessage as getApiError } from '../services/apiClient.js';

const emptyDepartment = { departmentName: '', departmentCode: '', course: '' };

const Departments = () => {
  const { courses, fetchCourses } = useCourses();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyDepartment);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await academicService.list();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await academicService.createDepartment(form);
      setForm(emptyDepartment);
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
        title="Departments"
        description="Organize academic programs, majors, and divisions."
        action={<button className="btn-primary" type="button" onClick={() => setShowModal(true)}>Add Department</button>}
      />

      {error && <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}

      {loading ? (
        <Skeleton rows={4} />
      ) : departments.length === 0 ? (
        <EmptyState
          title="No departments found"
          message="Create a department to categorize course programs and major subject areas."
          action={<button className="btn-primary" type="button" onClick={() => setShowModal(true)}>Add Department</button>}
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Department Code</th>
                <th>Course</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept._id}>
                  <td><strong>{dept.departmentName}</strong></td>
                  <td><span className="count-pill">{dept.departmentCode || 'N/A'}</span></td>
                  <td>{dept.course?.courseName || 'Linked Course'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showModal} title="Add Department" onClose={() => setShowModal(false)}>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="label">
            Department Name
            <input required className="input" value={form.departmentName} onChange={(e) => setForm({ ...form, departmentName: e.target.value })} placeholder="e.g. Computer Science" />
          </label>
          <label className="label">
            Department Code
            <input required className="input" value={form.departmentCode} onChange={(e) => setForm({ ...form, departmentCode: e.target.value })} placeholder="e.g. CSE" />
          </label>
          <label className="label">
            Course Link
            <select required value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
              <option value="">Select associated course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.courseName} ({course.courseCode})</option>
              ))}
            </select>
          </label>
          <button className="btn-primary w-fit" disabled={saving}>{saving ? 'Saving...' : 'Add Department'}</button>
        </form>
      </Modal>
    </section>
  );
};

export default Departments;


