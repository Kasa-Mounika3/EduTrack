import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { getApiError } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useData } from '../hooks/useData.js';

const emptyCourse = { courseName: '', courseCode: '', instructor: '', description: '' };

const Courses = () => {
  const { isAdmin } = useAuth();
  const { courses, courseMeta, loading, error, fetchCourses, createCourse, setError } = useData();
  const [form, setForm] = useState(emptyCourse);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCourses({ search, page, limit: 8 });
  }, [fetchCourses, search, page]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createCourse(form);
      setForm(emptyCourse);
      setShowForm(false);
      setPage(1);
      await fetchCourses({ search, page: 1, limit: 8 });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-grid">
      <PageHeader
        eyebrow="Courses"
        title="Course Catalog"
        description="Organize classes, instructors, and learning paths in one clear catalog."
        action={isAdmin && <button className="btn-primary" type="button" onClick={() => setShowForm(true)}>Add Course</button>}
      />

      <div className="panel grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <SearchBar value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search courses" />
        <div className="rounded-full bg-blue-50 px-4 py-2 text-center font-black text-blue-700 dark:bg-blue-950 dark:text-blue-200">
          {courseMeta.total ?? courses.length} courses
        </div>
      </div>
      {error && <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}
      {loading ? (
        <Skeleton rows={3} />
      ) : courses.length === 0 ? (
        <EmptyState title="No courses found" message="Add course details to start building the school catalog." action={isAdmin && <button className="btn-primary" type="button" onClick={() => setShowForm(true)}>Add Course</button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article className="panel" key={course._id}>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-brand dark:bg-blue-950 dark:text-blue-200">{course.courseCode}</span>
              <h3 className="mt-4 text-xl font-black">{course.courseName}</h3>
              <p className="muted mt-2 min-h-12">{course.description || 'Course details can be added anytime.'}</p>
              <div className="mt-4 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="muted text-sm font-bold">Instructor</p>
                <strong className="block">{course.instructor}</strong>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm font-bold">
                  <span>Progress</span>
                  <span>72%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-2 rounded-full bg-brand" style={{ width: '72%' }}></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={courseMeta.totalPages || 1} onPageChange={setPage} />

      <Modal open={showForm} title="Add Course" onClose={() => setShowForm(false)}>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="label">Course Name<input className="input" value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} /></label>
            <label className="label">Course Code<input className="input" value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} /></label>
            <label className="label">Instructor<input className="input" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} /></label>
            <label className="label">Description<input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          </div>
          <button className="btn-primary w-fit" disabled={saving}>{saving ? 'Saving...' : 'Add Course'}</button>
        </form>
      </Modal>
    </section>
  );
};

export default Courses;
