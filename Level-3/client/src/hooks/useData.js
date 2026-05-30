import { useContext } from 'react';
import { DataContext } from '../context/DataContext.jsx';

export const useData = () => {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error('useData must be used inside DataProvider');
  }

  return context;
};
