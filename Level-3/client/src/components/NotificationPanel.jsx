import { useState } from 'react';
import { useSocket } from '../hooks/useSocket.js';

const NotificationPanel = () => {
  const { connected, connectionError, notifications, unreadCount, markRead } = useSocket();
  const [open, setOpen] = useState(false);

  const togglePanel = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && unreadCount > 0) {
      await markRead();
    }
  };

  return (
    <div className="notification-menu">
      <button className="nav-button notification-button" type="button" onClick={togglePanel}>
        Notifications
        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-popover">
          <div className="notification-heading">
            <h3>Notifications</h3>
            <span className={connected ? 'online-text' : 'offline-text'}>
              {connected ? 'Online' : 'Offline'}
            </span>
          </div>
          {connectionError && <p className="alert error">{connectionError}</p>}
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="muted">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <article className="notification-item" key={notification._id || notification.createdAt}>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </article>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
