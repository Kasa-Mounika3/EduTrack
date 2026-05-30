import { useEffect, useState } from 'react';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('edutrack_theme');
  if (savedTheme) return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('edutrack_theme', theme);
  }, [theme]);

  return (
    <button
      className="btn-soft h-10 w-10 px-0"
      type="button"
      onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      aria-label="Change appearance"
      title="Change appearance"
    >
      {theme === 'dark' ? '☀' : '◐'}
    </button>
  );
};

export default ThemeToggle;
