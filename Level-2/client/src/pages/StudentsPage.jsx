import { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';
import Notification from '../components/Notification.jsx';
import StudentTable from '../components/StudentTable.jsx';
import { useStudents } from '../hooks/useStudents.js';
import { getApiErrorMessage } from '../services/studentService.js';

const StudentsPage = () => {
  const { students, meta, loading, error, fetchStudents, removeStudent, setError } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchStudents({ search: searchTerm, page, limit: 8 });
  }, [fetchStudents, searchTerm, page]);

  const handleDelete = async () => {
    try {
      await removeStudent(selectedStudent._id);
      setSelectedStudent(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <section className="page">
      <Notification />
      <div className="page-header">
        <div>
          <p className="eyebrow">Directory</p>
          <h1>Students</h1>
          <p>Search, view, edit, and remove student records.</p>
        </div>
        <div className="count-pill">{meta.total ?? students.length} students</div>
      </div>

      <div className="panel">
        <SearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setPage(1);
          }}
        />
        {error && <div className="alert error">{error}</div>}
        {loading ? (
          <Loader text="Loading students..." />
        ) : (
          <>
            <StudentTable students={students} onDeleteClick={setSelectedStudent} />
            <div className="pagination">
              <button
                type="button"
                className="small-button"
                disabled={page <= 1}
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                Previous
              </button>
              <span>
                Page {meta.page || page} of {meta.totalPages || 1}
              </span>
              <button
                type="button"
                className="small-button"
                disabled={page >= (meta.totalPages || 1)}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {selectedStudent && (
        <Modal
          title="Delete Student"
          message={`Are you sure you want to delete ${
            selectedStudent.studentName || selectedStudent.name
          }?`}
          confirmText="Delete"
          onClose={() => setSelectedStudent(null)}
          onConfirm={handleDelete}
        />
      )}
    </section>
  );
};

export default StudentsPage;
