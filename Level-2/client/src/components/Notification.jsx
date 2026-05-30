import { useStudents } from '../hooks/useStudents.js';

const Notification = () => {
  const { notification } = useStudents();

  if (!notification) {
    return null;
  }

  return (
    <div className="notification" role="status" aria-live="polite">
      {notification}
    </div>
  );
};

export default Notification;
