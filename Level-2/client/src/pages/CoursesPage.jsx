import { useEffect, useState } from 'react';
import CourseForm from '../components/CourseForm.jsx';
import Loader from '../components/Loader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useCourses } from '../hooks/useCourses.js';
import { getApiErrorMessage } from '../services/courseService.js';

const CoursesPage = () => {
  const { isAdmin } = useAuth();
  const { courses, meta, loading, error, notification, fetchCourses, addCourse, setError } =
    useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCourses({ search: searchTerm, page, limit: 8 });
  }, [fetchCourses, searchTerm, page]);

  const handleCreateCourse = async (course) => {
    try {
      await addCourse(course);
      await fetchCourses({ search: searchTerm, page: 1, limit: 8 });
      setPage(1);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <section className="page">
      {notification && <div className="notification">{notification}</div>}
      <div className="page-header">
        <div>
          <p className="eyebrow">Courses</p>
          <h1>Course Management</h1>
          <p>Create courses and connect students to course records using ObjectId references.</p>
        </div>
        <div className="count-pill">{meta.total ?? courses.length} courses</div>
      </div>

      {isAdmin && (
        <div className="panel spaced-panel">
          <div className="panel-heading">
            <h2>Add Course</h2>
          </div>
          <CourseForm onSubmit={handleCreateCourse} />
        </div>
      )}

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
          <Loader text="Loading courses..." />
        ) : courses.length > 0 ? (
          <>
            <div className="course-grid">
              {courses.map((course) => (
                <article className="course-card" key={course._id}>
                  <span>{course.courseCode}</span>
                  <h3>{course.courseName}</h3>
                  <p>{course.description || 'No description added.'}</p>
                  <strong>{course.instructor}</strong>
                </article>
              ))}
            </div>
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
        ) : (
          <div className="empty-state">
            <h3>No courses found</h3>
            <p>Create a course before adding student records.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesPage;
