import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const StudentTable = ({ students, onDeleteClick }) => {
  const { isAdmin, isTeacher } = useAuth();

  if (students.length === 0) {
    return (
      <div className="empty-state">
        <h3>No students found</h3>
        <p>Add a student or change your search filter.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Course</th>
            <th>Age</th>
            <th>Attendance</th>
            <th>Marks</th>
            <th>Grade</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>
                <strong>{student.studentName || student.name}</strong>
                <span className="table-id">{student.studentId || student._id}</span>
              </td>
              <td>{student.email}</td>
              <td>
                {typeof student.course === 'object'
                  ? `${student.course.courseCode} - ${student.course.courseName}`
                  : student.course}
              </td>
              <td>{student.age || '-'}</td>
              <td>{student.attendance ?? 0}%</td>
              <td>{student.marks ?? 0}</td>
              <td>{student.grade || '-'}</td>
              <td>
                <div className="row-actions">
                  <Link className="small-button" to={`/students/${student._id}`}>
                    View
                  </Link>
                  {isAdmin && (
                    <Link className="small-button" to={`/edit-student/${student._id}`}>
                      Edit
                    </Link>
                  )}
                  {isTeacher && (
                    <Link className="small-button" to={`/students/${student._id}`}>
                      Update Progress
                    </Link>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      className="small-button danger-text"
                      onClick={() => onDeleteClick(student)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
