import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import PageHeader from '../components/PageHeader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { GET_STUDENTS_QUERY } from '../graphql/queries.js';

const Reports = () => {
  const [search, setSearch] = useState('');
  const { data, loading, error, refetch } = useQuery(GET_STUDENTS_QUERY, {
    variables: { search, page: 1, limit: 8 },
    fetchPolicy: 'cache-and-network'
  });

  const students = data?.getStudents || [];
  const averageMarks = students.length
    ? Math.round(students.reduce((total, student) => total + (student.marks || 0), 0) / students.length)
    : 0;
  const averageAttendance = students.length
    ? Math.round(students.reduce((total, student) => total + (student.attendance || 0), 0) / students.length)
    : 0;

  return (
    <section className="section-grid">
      <PageHeader
        eyebrow="Reports"
        title="Academic Insights"
        description="Review performance, attendance, and course trends from one clear workspace."
        action={<button className="btn-soft" type="button" onClick={() => refetch()}>Refresh</button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <article className="panel">
          <p className="muted text-sm font-bold">Students Reviewed</p>
          <strong className="mt-2 block text-4xl">{students.length}</strong>
        </article>
        <article className="panel">
          <p className="muted text-sm font-bold">Average Attendance</p>
          <strong className="mt-2 block text-4xl">{averageAttendance}%</strong>
        </article>
        <article className="panel">
          <p className="muted text-sm font-bold">Average Score</p>
          <strong className="mt-2 block text-4xl">{averageMarks}</strong>
        </article>
      </div>

      <div className="panel">
        <SearchBar value={search} onChange={setSearch} placeholder="Search student reports" />
      </div>

      {error && <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">{error.message}</div>}

      {loading && !students.length ? (
        <Skeleton rows={3} />
      ) : students.length === 0 ? (
        <EmptyState title="No report data yet" message="Add student records to begin viewing academic insights." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {students.map((student) => {
            const displayName = student.studentName || student.name || 'Student';
            return (
            <article className="panel" key={student._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">{displayName}</h2>
                  <p className="muted text-sm">{student.course?.courseName || 'Course pending'}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                  {student.grade}
                </span>
              </div>
              <div className="mt-5 grid gap-3">
                <div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>Attendance</span>
                    <span>{student.attendance ?? 0}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${student.attendance ?? 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>Score</span>
                    <span>{student.marks ?? 0}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${student.marks ?? 0}%` }}></div>
                  </div>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Reports;
