import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/Loader.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { getApiError } from '../services/api.js';
import { studentService } from '../services/studentService.js';
import { useAuth } from '../hooks/useAuth.js';

const DetailCard = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
    <dt className="muted">{label}</dt>
    <dd className="font-black">{value || 'Not added'}</dd>
  </div>
);

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
};

const StudentDetails = () => {
  const { id } = useParams();
  const { isAdmin, user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const [student, setStudent] = useState(null);
  const [progressForm, setProgressForm] = useState({ attendance: '', marks: '', courseProgress: '', remarks: '', resultPublished: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const data = await studentService.getById(id);
        setStudent(data);
        setProgressForm({
          attendance: data.attendance ?? '',
          marks: data.marks ?? '',
          courseProgress: data.courseProgress ?? '',
          remarks: data.remarks || '',
          resultPublished: Boolean(data.resultPublished)
        });
      } catch (err) {
        setError(getApiError(err));
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
        marks: progressForm.marks === '' ? undefined : Number(progressForm.marks),
        courseProgress: progressForm.courseProgress === '' ? undefined : Number(progressForm.courseProgress),
        remarks: progressForm.remarks,
        resultPublished: progressForm.resultPublished
      });
      const updatedStudent = await studentService.getById(student._id);
      setStudent(updatedStudent);
      setMessage('Academic progress updated successfully');
    } catch (err) {
      setError(getApiError(err));
    }
  };

  if (loading) return <Loader text="Loading student..." />;
  const displayName = student?.studentName || student?.name || 'Student';

  return (
    <section className="mx-auto grid max-w-5xl gap-5">
      {error && <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}
      {message && <div className="rounded-xl bg-emerald-50 p-3 font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{message}</div>}
      {student && (
        <>
          <PageHeader eyebrow="Student Profile" title={displayName} description="Personal information, contact details, academic record, and parent information." />
          <article className="panel grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="text-center">
              <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-3xl bg-blue-50 text-4xl font-black text-brand dark:bg-blue-950">
                {student.profilePhoto ? <img className="h-full w-full object-cover" src={student.profilePhoto} alt={displayName} /> : displayName.charAt(0)}
              </div>
              <p className="muted mt-3 text-sm">{student.studentId || 'Student ID pending'}</p>
            </div>
            <div>
              <h1 className="text-3xl font-black">{displayName}</h1>
              <p className="muted">{student.email}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <DetailCard label="Attendance" value={`${student.attendance ?? 0}%`} />
                <DetailCard label="Score" value={student.marks ?? 0} />
                <DetailCard label="Grade" value={student.grade} />
              </div>
            </div>
          </article>

          <article className="panel">
            <h2 className="text-xl font-black">Personal Information</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailCard label="First Name" value={student.firstName} />
              <DetailCard label="Last Name" value={student.lastName} />
              <DetailCard label="Gender" value={student.gender} />
              <DetailCard label="Date of Birth" value={formatDate(student.dateOfBirth)} />
            </dl>
          </article>

          <article className="panel">
            <h2 className="text-xl font-black">Contact Information</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailCard label="Phone Number" value={student.phone} />
              <DetailCard label="Alternate Phone Number" value={student.alternatePhone} />
              <DetailCard label="Address" value={student.address} />
              <DetailCard label="City" value={student.city} />
              <DetailCard label="State" value={student.state} />
              <DetailCard label="Country" value={student.country} />
            </dl>
          </article>

          <article className="panel">
            <h2 className="text-xl font-black">Academic Information</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailCard label="Course" value={student.course?.displayName || `${student.course?.courseCode || ''} - ${student.course?.courseName || ''}`} />
              <DetailCard label="Instructor" value={student.course?.instructor} />
              <DetailCard label="Department" value={student.department} />
              <DetailCard label="Year" value={student.year} />
              <DetailCard label="Semester" value={student.semester} />
              <DetailCard label="Admission Date" value={formatDate(student.admissionDate)} />
              <DetailCard label="Course Progress" value={`${student.courseProgress ?? 0}%`} />
              <DetailCard label="Teacher Remarks" value={student.remarks} />
              <DetailCard label="Result Status" value={student.resultPublished ? 'Published' : 'Draft'} />
            </dl>
          </article>

          {isTeacher && (
            <form className="panel" onSubmit={handleProgressUpdate}>
              <h2 className="text-xl font-black">Update Academic Records</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="label">
                  Attendance
                  <input className="input" type="number" min="0" max="100" value={progressForm.attendance} onChange={(event) => setProgressForm({ ...progressForm, attendance: event.target.value })} />
                </label>
                <label className="label">
                  Marks
                  <input className="input" type="number" min="0" max="100" value={progressForm.marks} onChange={(event) => setProgressForm({ ...progressForm, marks: event.target.value })} />
                </label>
                <label className="label">
                  Course Progress
                  <input className="input" type="number" min="0" max="100" value={progressForm.courseProgress} onChange={(event) => setProgressForm({ ...progressForm, courseProgress: event.target.value })} />
                </label>
                <label className="label">
                  Publish Results
                  <select className="input" value={progressForm.resultPublished ? 'yes' : 'no'} onChange={(event) => setProgressForm({ ...progressForm, resultPublished: event.target.value === 'yes' })}>
                    <option value="no">Draft</option>
                    <option value="yes">Published</option>
                  </select>
                </label>
                <label className="label md:col-span-2">
                  Teacher Remarks
                  <input className="input" value={progressForm.remarks} onChange={(event) => setProgressForm({ ...progressForm, remarks: event.target.value })} />
                </label>
              </div>
              <button className="btn-primary mt-4" type="submit">Save Academic Record</button>
            </form>
          )}

          <article className="panel">
            <h2 className="text-xl font-black">Parent Information</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailCard label="Parent Name" value={student.parentName || student.parent?.name} />
              <DetailCard label="Relationship" value={student.parentRelationship || student.parent?.relationship} />
              <DetailCard label="Parent Phone Number" value={student.parentPhone || student.parent?.phone} />
              <DetailCard label="Parent Email" value={student.parentEmail || student.parent?.email} />
            </dl>
          </article>

          <div className="flex justify-center gap-3">
            {isAdmin && <Link className="btn-primary" to={`/edit-student/${student._id}`}>Edit</Link>}
            <Link className="btn-soft" to="/students">Back</Link>
          </div>
        </>
      )}
    </section>
  );
};

export default StudentDetails;
