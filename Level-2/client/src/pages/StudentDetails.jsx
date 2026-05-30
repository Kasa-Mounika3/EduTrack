import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/Loader.jsx';
import { getApiErrorMessage, studentService } from '../services/studentService.js';
import { useAuth } from '../hooks/useAuth.js';

const StudentDetails = () => {
  const { id } = useParams();
  const { isAdmin, isTeacher } = useAuth();
  const [student, setStudent] = useState(null);
  const [progressForm, setProgressForm] = useState({ attendance: '', marks: '', courseProgress: '', remarks: '', resultPublished: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const data = await studentService.getStudentById(id);
        setStudent(data);
        setProgressForm({
          attendance: data.attendance ?? '',
          marks: data.marks ?? '',
          courseProgress: data.courseProgress ?? '',
          remarks: data.remarks || '',
          resultPublished: Boolean(data.resultPublished)
        });
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [id]);

  const handleProgressUpdate = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await studentService.updateAttendance(student._id, Number(progressForm.attendance));
      await studentService.updateGrades(student._id, {
        marks: Number(progressForm.marks),
        courseProgress: Number(progressForm.courseProgress),
        remarks: progressForm.remarks,
        resultPublished: progressForm.resultPublished
      });
      const updatedStudent = await studentService.getStudentById(student._id);
      setStudent(updatedStudent);
      setMessage('Academic progress updated successfully');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <section className="page narrow-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Student Details</h1>
          <p>Read one student record from the backend using route parameters.</p>
        </div>
      </div>

      <div className="panel">
        {loading && <Loader text="Loading student details..." />}
        {message && <div className="notification">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        {!loading && student && (
          <article className="details-card">
            <div className="avatar large-avatar" aria-hidden="true">
              {student.profilePhoto ? <img src={student.profilePhoto} alt={student.studentName || student.name} /> : (student.studentName || student.name).charAt(0).toUpperCase()}
            </div>
            <h2>{student.studentName || student.name}</h2>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{student.email}</dd>
              </div>
              <div>
                <dt>Student ID</dt>
                <dd>{student.studentId || 'Not added'}</dd>
              </div>
              <div>
                <dt>First Name</dt>
                <dd>{student.firstName || 'Not added'}</dd>
              </div>
              <div>
                <dt>Last Name</dt>
                <dd>{student.lastName || 'Not added'}</dd>
              </div>
              <div>
                <dt>Gender</dt>
                <dd>{student.gender || 'Not added'}</dd>
              </div>
              <div>
                <dt>Date of Birth</dt>
                <dd>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not added'}</dd>
              </div>
              <div>
                <dt>Phone Number</dt>
                <dd>{student.phone || 'Not added'}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{student.address || 'Not added'}</dd>
              </div>
              <div>
                <dt>City</dt>
                <dd>{student.city || 'Not added'}</dd>
              </div>
              <div>
                <dt>State</dt>
                <dd>{student.state || 'Not added'}</dd>
              </div>
              <div>
                <dt>Country</dt>
                <dd>{student.country || 'Not added'}</dd>
              </div>
              <div>
                <dt>Course</dt>
                <dd>
                  {typeof student.course === 'object'
                    ? `${student.course.courseCode} - ${student.course.courseName}`
                    : student.course}
                </dd>
              </div>
              {typeof student.course === 'object' && (
                <div>
                  <dt>Instructor</dt>
                  <dd>{student.course.instructor}</dd>
                </div>
              )}
              <div>
                <dt>Age</dt>
                <dd>{student.age || 'Not added'}</dd>
              </div>
              <div>
                <dt>Attendance</dt>
                <dd>{student.attendance ?? 0}%</dd>
              </div>
              <div>
                <dt>Marks</dt>
                <dd>{student.marks ?? 0}</dd>
              </div>
              <div>
                <dt>Grade</dt>
                <dd>{student.grade || 'Not graded'}</dd>
              </div>
              <div>
                <dt>Course Progress</dt>
                <dd>{student.courseProgress ?? 0}%</dd>
              </div>
              <div>
                <dt>Teacher Remarks</dt>
                <dd>{student.remarks || 'Not added'}</dd>
              </div>
              <div>
                <dt>Result Status</dt>
                <dd>{student.resultPublished ? 'Published' : 'Draft'}</dd>
              </div>
              <div>
                <dt>Teacher</dt>
                <dd>{student.teacherId?.teacherName || 'Not assigned'}</dd>
              </div>
              <div>
                <dt>Parent</dt>
                <dd>{student.parentId?.parentName || 'Not assigned'}</dd>
              </div>
              <div>
                <dt>Department</dt>
                <dd>{student.department || 'Not added'}</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>{student.year || 'Not added'}</dd>
              </div>
              <div>
                <dt>Semester</dt>
                <dd>{student.semester || 'Not added'}</dd>
              </div>
              <div>
                <dt>Admission Date</dt>
                <dd>{student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'Not added'}</dd>
              </div>
              <div>
                <dt>Parent Name</dt>
                <dd>{student.parentName || student.parentId?.parentName || 'Not added'}</dd>
              </div>
              <div>
                <dt>Parent Relationship</dt>
                <dd>{student.parentRelationship || 'Not added'}</dd>
              </div>
              <div>
                <dt>Parent Phone Number</dt>
                <dd>{student.parentPhone || student.parentId?.phone || 'Not added'}</dd>
              </div>
              <div>
                <dt>Parent Email</dt>
                <dd>{student.parentEmail || student.parentId?.email || 'Not added'}</dd>
              </div>
            </dl>
            {isTeacher && (
              <form className="student-form spaced-panel" onSubmit={handleProgressUpdate}>
                <div className="panel-heading">
                  <h2>Update Progress</h2>
                </div>
                <div className="form-grid">
                  <label>
                    <span>Attendance (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={progressForm.attendance}
                      onChange={(event) =>
                        setProgressForm({ ...progressForm, attendance: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    <span>Marks</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={progressForm.marks}
                      onChange={(event) => setProgressForm({ ...progressForm, marks: event.target.value })}
                    />
                  </label>
                  <label>
                    <span>Course Progress (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={progressForm.courseProgress}
                      onChange={(event) =>
                        setProgressForm({ ...progressForm, courseProgress: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    <span>Teacher Remarks</span>
                    <input
                      value={progressForm.remarks}
                      onChange={(event) => setProgressForm({ ...progressForm, remarks: event.target.value })}
                    />
                  </label>
                  <label>
                    <span>Publish Results</span>
                    <select
                      value={progressForm.resultPublished ? 'yes' : 'no'}
                      onChange={(event) => setProgressForm({ ...progressForm, resultPublished: event.target.value === 'yes' })}
                    >
                      <option value="no">Draft</option>
                      <option value="yes">Published</option>
                    </select>
                  </label>
                </div>
                <button className="primary-button" type="submit">
                  Save Progress
                </button>
              </form>
            )}
            <div className="detail-actions">
              {isAdmin && (
                <Link className="primary-link" to={`/edit-student/${student._id}`}>
                  Edit Student
                </Link>
              )}
              <Link className="ghost-link" to="/students">
                Back
              </Link>
            </div>
          </article>
        )}
      </div>
    </section>
  );
};

export default StudentDetails;
