import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader.jsx';
import Notification from '../components/Notification.jsx';
import StudentForm from '../components/StudentForm.jsx';
import { useCourses } from '../hooks/useCourses.js';
import { useStudents } from '../hooks/useStudents.js';
import { getApiErrorMessage, studentService } from '../services/studentService.js';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { editStudent } = useStudents();
  const { courses, fetchCourses, loading: coursesLoading, error: coursesError } = useCourses();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const data = await studentService.getStudentById(id);
        setStudent(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
    fetchCourses({ limit: 50 });
  }, [id, fetchCourses]);

  const handleSubmit = async (updatedStudent) => {
    try {
      await editStudent(id, updatedStudent);
      navigate('/students');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <section className="page narrow-page">
      <Notification />
      <div className="page-header">
        <div>
          <p className="eyebrow">Update</p>
          <h1>Edit Student</h1>
          <p>Update the student record and save changes through the REST API.</p>
        </div>
      </div>

      <div className="panel">
        {(loading || coursesLoading) && <Loader text="Loading form data..." />}
        {(error || coursesError) && <div className="alert error">{error || coursesError}</div>}
        {!loading && !coursesLoading && student && (
          <StudentForm
            courses={courses}
            initialValues={student}
            submitLabel="Update Student"
            onSubmit={handleSubmit}
          />
        )}
        {!loading && !student && !error && (
          <div className="empty-state">
            <h3>Student not found</h3>
            <Link className="text-link" to="/students">
              Back to students
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default EditStudent;
