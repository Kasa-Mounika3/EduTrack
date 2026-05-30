import { useData } from '../hooks/useData.js';

const Toast = () => {
  const { toast } = useData();

  if (!toast) return null;

  return (
    <div className="fixed right-4 top-4 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-bold text-emerald-700 shadow-soft dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
      {toast}
    </div>
  );
};

export default Toast;
