import { createContext, useCallback, useMemo, useState } from 'react';
import { courseService } from '../services/courseService.js';
import { studentService } from '../services/studentService.js';
import { getApiError } from '../services/api.js';

export const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [studentMeta, setStudentMeta] = useState({});
  const [courses, setCourses] = useState([]);
  const [courseMeta, setCourseMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  }, []);

  const fetchStudents = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');

    try {
      const result = await studentService.list(params);
      setStudents(result.students);
      setStudentMeta(result.meta);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');

    try {
      const result = await courseService.list(params);
      setCourses(result.courses);
      setCourseMeta(result.meta);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = async (payload) => {
    const student = await studentService.create(payload);
    setStudents((current) => [student, ...current]);
    showToast('Student added successfully');
    return student;
  };

  const updateStudent = async (id, payload) => {
    const student = await studentService.update(id, payload);
    setStudents((current) => current.map((item) => (item._id === id ? student : item)));
    showToast('Student updated successfully');
    return student;
  };

  const deleteStudent = async (id) => {
    await studentService.remove(id);
    setStudents((current) => current.filter((student) => student._id !== id));
    showToast('Student removed successfully');
  };

  const createCourse = async (payload) => {
    const course = await courseService.create(payload);
    setCourses((current) => [course, ...current]);
    showToast('Course added successfully');
    return course;
  };

  const value = useMemo(
    () => ({
      students,
      studentMeta,
      courses,
      courseMeta,
      loading,
      error,
      toast,
      fetchStudents,
      fetchCourses,
      createStudent,
      updateStudent,
      deleteStudent,
      createCourse,
      setError
    }),
    [students, studentMeta, courses, courseMeta, loading, error, toast, fetchStudents, fetchCourses]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
