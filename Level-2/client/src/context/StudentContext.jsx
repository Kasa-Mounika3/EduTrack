import { createContext, useCallback, useMemo, useState } from 'react';
import { getApiErrorMessage, studentService } from '../services/studentService.js';

export const StudentContext = createContext(null);

export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  const showNotification = useCallback((message) => {
    setNotification(message);
    window.setTimeout(() => setNotification(''), 3200);
  }, []);

  const fetchStudents = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');

    try {
      const result = await studentService.getStudents(params);
      setStudents(result.students);
      setMeta(result.meta);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const addStudent = async (student) => {
    setError('');
    const result = await studentService.createStudent(student);
    const createdStudent = result.student || result;
    setStudents((currentStudents) => [createdStudent, ...currentStudents]);
    showNotification('Student profile and login account created successfully');
    return result;
  };

  const editStudent = async (id, student) => {
    setError('');
    const updatedStudent = await studentService.updateStudent(id, student);
    setStudents((currentStudents) =>
      currentStudents.map((item) => (item._id === id ? updatedStudent : item))
    );
    showNotification('Student updated successfully');
    return updatedStudent;
  };

  const removeStudent = async (id) => {
    setError('');
    await studentService.deleteStudent(id);
    setStudents((currentStudents) => currentStudents.filter((student) => student._id !== id));
    showNotification('Student deleted successfully');
  };

  const value = useMemo(
    () => ({
      students,
      meta,
      loading,
      error,
      notification,
      fetchStudents,
      addStudent,
      editStudent,
      removeStudent,
      setError
    }),
    [students, loading, error, notification, fetchStudents]
  );

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
};
