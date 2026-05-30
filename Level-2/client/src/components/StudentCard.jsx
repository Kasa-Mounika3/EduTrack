import { Link } from 'react-router-dom';

const StudentCard = ({ student }) => {
  const studentName = student.studentName || student.name;
  const courseName =
    typeof student.course === 'object'
      ? `${student.course.courseCode} - ${student.course.courseName}`
      : student.course;

  return (
    <article className="student-card">
      <div className="avatar" aria-hidden="true">
        {student.profilePhoto ? <img src={student.profilePhoto} alt={studentName} /> : studentName.charAt(0).toUpperCase()}
      </div>
      <div>
        <h3>{studentName}</h3>
        <p>{student.email}</p>
      </div>
      <dl>
        <div>
          <dt>Student ID</dt>
          <dd>{student.studentId || 'Not added'}</dd>
        </div>
        <div>
          <dt>Course</dt>
          <dd>{courseName}</dd>
        </div>
        <div>
          <dt>Age</dt>
          <dd>{student.age || 'Not added'}</dd>
        </div>
        <div>
          <dt>Grade</dt>
          <dd>{student.grade || 'Not graded'}</dd>
        </div>
      </dl>
      <Link className="text-link" to={`/students/${student._id}`}>
        View details
      </Link>
    </article>
  );
};

export default StudentCard;
