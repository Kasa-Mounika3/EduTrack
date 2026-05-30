import { useContext } from 'react';
import { CourseContext } from '../context/CourseContext.jsx';

export const useCourses = () => {
  const context = useContext(CourseContext);

  if (!context) {
    throw new Error('useCourses must be used inside CourseProvider');
  }

  return context;
};
