import { createContext, useCallback, useMemo, useState } from 'react';
import { courseService, getApiErrorMessage } from '../services/courseService.js';

export const CourseContext = createContext(null);

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  const showNotification = useCallback((message) => {
    setNotification(message);
    window.setTimeout(() => setNotification(''), 3200);
  }, []);

  const fetchCourses = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');

    try {
      const result = await courseService.getCourses(params);
      setCourses(result.courses);
      setMeta(result.meta);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const addCourse = async (course) => {
    setError('');
    const createdCourse = await courseService.createCourse(course);
    setCourses((currentCourses) => [createdCourse, ...currentCourses]);
    showNotification('Course created successfully');
    return createdCourse;
  };

  const value = useMemo(
    () => ({
      courses,
      meta,
      loading,
      error,
      notification,
      fetchCourses,
      addCourse,
      setError
    }),
    [courses, meta, loading, error, notification, fetchCourses]
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};
