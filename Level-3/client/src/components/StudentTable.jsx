import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const StudentTable = ({ students, onEdit, onDelete }) => {
  const { isAdmin, user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  if (students.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xl font-black">No students found</h3>
        <p className="muted mt-2">Try a different search or add a student.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <table className="min-w-[980px] w-full border-collapse text-left">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          <tr>
            <th className="p-4">Student</th>
            <th className="p-4">Course</th>
            <th className="p-4">Attendance</th>
            <th className="p-4">Marks</th>
            <th className="p-4">Grade</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const displayName = student.studentName || student.name || 'Student';
            return (
            <tr className="border-t border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800" key={student._id}>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-blue-50 font-black text-brand dark:bg-blue-950">
                    {student.profilePhoto ? <img className="h-full w-full object-cover" src={student.profilePhoto} alt={displayName} /> : displayName.charAt(0)}
                  </div>
                  <div>
                    <strong>{displayName}</strong>
                    <span className="muted block text-sm">{student.studentId || student.email}</span>
                  </div>
                </div>
              </td>
              <td className="p-4">
                {typeof student.course === 'object'
                  ? `${student.course.courseCode} - ${student.course.courseName}`
                  : student.course}
              </td>
              <td className="p-4">{student.attendance ?? 0}%</td>
              <td className="p-4">{student.marks ?? 0}</td>
              <td className="p-4">{student.grade}</td>
              <td className="p-4">
                <div className="flex gap-2">
                  <Link className="btn-soft min-h-8 px-3 py-1" to={`/students/${student._id}`}>
                    View
                  </Link>
                  {isAdmin && (
                    <button className="btn-soft min-h-8 px-3 py-1" type="button" onClick={() => onEdit?.(student)}>
                      Edit
                    </button>
                  )}
                  {isTeacher && (
                    <Link className="btn-soft min-h-8 px-3 py-1" to={`/students/${student._id}`}>
                      Update Progress
                    </Link>
                  )}
                  {isAdmin && (
                    <button className="btn-danger min-h-8 px-3 py-1" type="button" onClick={() => onDelete(student)}>
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
