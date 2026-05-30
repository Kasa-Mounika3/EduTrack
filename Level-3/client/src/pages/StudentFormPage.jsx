import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StudentForm from '../components/StudentForm.jsx';
import { getApiError } from '../services/api.js';
import { studentService } from '../services/studentService.js';
import { useData } from '../hooks/useData.js';

const StudentFormPage = ({ mode }) => {
  const isEdit = mode === 'edit';
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, fetchCourses, createStudent, updateStudent } = useData();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses({ limit: 50 });

    if (!isEdit) return;

    const loadStudent = async () => {
      try {
        setStudent(await studentService.getById(id));
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [fetchCourses, id, isEdit]);

  const handleSubmit = async (payload) => {
    try {
      if (isEdit) {
        await updateStudent(id, payload);
      } else {
        await createStudent(payload);
      }
      navigate('/students');
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <section className="mx-auto grid max-w-3xl gap-5">
      <PageHeader
        eyebrow="Students"
        title={isEdit ? 'Edit Student' : 'Add New Student'}
        description={isEdit ? 'Update student information and academic progress.' : 'Create a new student record for your school.'}
      />
      {error && <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}
      {loading ? (
        <Loader text="Loading student..." />
      ) : isEdit && !student ? (
        <div className="panel text-center">
          <h2 className="text-xl font-black">Student not found</h2>
          <Link className="mt-3 inline-flex font-black text-brand" to="/students">Back to students</Link>
        </div>
      ) : (
        <StudentForm
          courses={courses}
          initialValues={student || {}}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Save Changes' : 'Add Student'}
        />
      )}
    </section>
  );
};

export default StudentFormPage;
