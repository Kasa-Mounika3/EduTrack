import { useSocket } from '../hooks/useSocket.js';

const UpdateToast = () => {
  const { toast } = useSocket();

  if (!toast) return null;

  return (
    <div className="fixed left-4 top-4 z-50 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 font-bold text-blue-800 shadow-soft dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
      {toast}
    </div>
  );
};

export default UpdateToast;
