import { useContext } from 'react';
import { StudentContext } from '../context/StudentContext.jsx';

export const useStudents = () => {
  const context = useContext(StudentContext);

  if (!context) {
    throw new Error('useStudents must be used inside StudentProvider');
  }

  return context;
};
