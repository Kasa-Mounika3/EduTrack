import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentForm from '../components/StudentForm.jsx';
import Notification from '../components/Notification.jsx';
import { useStudents } from '../hooks/useStudents.js';
import { useCourses } from '../hooks/useCourses.js';
import { getApiErrorMessage } from '../services/studentService.js';

const AddStudent = () => {
  const navigate = useNavigate();
  const { addStudent } = useStudents();
  const { courses, fetchCourses, loading: coursesLoading, error: coursesError } = useCourses();
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState(null);

  useEffect(() => {
    fetchCourses({ limit: 50 });
  }, [fetchCourses]);

  const handleSubmit = async (student) => {
    try {
      const result = await addStudent(student);
      setCredentials(result.loginCredentials);
      window.setTimeout(() => navigate('/students'), 5000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <section className="page narrow-page">
      <Notification />
      <div className="page-header">
        <div>
          <p className="eyebrow">Create</p>
          <h1>Add Student</h1>
          <p>Fill in the student details and save them to MongoDB through the API.</p>
        </div>
      </div>

      <div className="panel">
        {credentials && (
          <div className="notification">
            Student login created: {credentials.email} / {credentials.temporaryPassword}
          </div>
        )}
        {(error || coursesError) && <div className="alert error">{error || coursesError}</div>}
        {coursesLoading ? (
          <p className="muted-text">Loading courses...</p>
        ) : (
          <StudentForm courses={courses} submitLabel="Create Student" onSubmit={handleSubmit} />
        )}
      </div>
    </section>
  );
};

export default AddStudent;
