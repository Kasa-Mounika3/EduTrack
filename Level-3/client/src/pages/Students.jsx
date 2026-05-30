import { useEffect, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Skeleton from '../components/Skeleton.jsx';
import StudentForm from '../components/StudentForm.jsx';
import StudentTable from '../components/StudentTable.jsx';
import { getApiError } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useData } from '../hooks/useData.js';

const Students = () => {
  const { isAdmin } = useAuth();
  const {
    students,
    studentMeta,
    courses,
    loading,
    error,
    fetchStudents,
    fetchCourses,
    createStudent,
    updateStudent,
    deleteStudent,
    setError
  } = useData();
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('');
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchStudents({ search, course, page, limit: 8 });
  }, [fetchStudents, search, course, page]);

  useEffect(() => {
    fetchCourses({ limit: 50 });
  }, [fetchCourses]);

  const closeModal = () => {
    setModalMode(null);
    setSelectedStudent(null);
  };

  const handleSubmit = async (payload) => {
    if (modalMode === 'edit' && selectedStudent) {
      await updateStudent(selectedStudent._id, payload);
    } else {
      await createStudent(payload);
    }
    closeModal();
    await fetchStudents({ search, course, page, limit: 8 });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteStudent(pendingDelete._id);
      setPendingDelete(null);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <section className="section-grid">
      <PageHeader
        eyebrow="Students"
        title="Student Directory"
        description="Find, update, and review student information with a clean record view."
        action={isAdmin && <button className="btn-primary" type="button" onClick={() => setModalMode('add')}>Add New Student</button>}
      />

      <div className="panel grid gap-3 md:grid-cols-[1fr_240px_auto] md:items-center">
        <SearchBar value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search students" />
        <select className="input" value={course} onChange={(event) => { setCourse(event.target.value); setPage(1); }}>
          <option value="">All courses</option>
          {courses.map((item) => (
            <option key={item._id} value={item._id}>{item.courseCode} - {item.courseName}</option>
          ))}
        </select>
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-center font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
          {studentMeta.total ?? students.length} records
        </div>
      </div>
      {error && <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}
      {loading ? (
        <Skeleton rows={4} />
      ) : students.length === 0 ? (
        <EmptyState title="No students found" message="Try a different search or add a new student record." action={isAdmin && <button className="btn-primary" type="button" onClick={() => setModalMode('add')}>Add New Student</button>} />
      ) : (
        <StudentTable
          students={students}
          onEdit={(student) => {
            setSelectedStudent(student);
            setModalMode('edit');
          }}
          onDelete={setPendingDelete}
        />
      )}
      <Pagination page={page} totalPages={studentMeta.totalPages || 1} onPageChange={setPage} />

      <Modal open={Boolean(modalMode)} title={modalMode === 'edit' ? 'Edit Student' : 'Add New Student'} onClose={closeModal}>
        <StudentForm
          courses={courses}
          initialValues={selectedStudent || {}}
          onSubmit={handleSubmit}
          submitLabel={modalMode === 'edit' ? 'Save Changes' : 'Add Student'}
          frameless
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove student record?"
        message={pendingDelete ? `${pendingDelete.studentName || pendingDelete.name || 'This student'} will no longer appear in the student directory.` : ''}
        confirmLabel="Remove"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
};

export default Students;
