import AnnouncementForm from '../components/AnnouncementForm.jsx';
import ChatBox from '../components/ChatBox.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useSocket } from '../hooks/useSocket.js';

const Messages = () => {
  const { isAdmin, isTeacher } = useAuth();
  const { connected, connectionError, onlineUsers } = useSocket();

  return (
    <section className="section-grid">
      <PageHeader
        eyebrow="Messages"
        title="Communication Center"
        description="Send announcements, view updates, and message people across your school."
        action={<div className={`rounded-full px-4 py-2 font-black ${connected ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200'}`}>{connected ? 'Online' : 'Offline'}</div>}
      />

      {connectionError && <div className="rounded-xl bg-red-50 p-3 font-bold text-red-700 dark:bg-red-950 dark:text-red-200">{connectionError}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <article className="panel">
          <span className="muted">People Online</span>
          <strong className="block text-4xl">{onlineUsers.length}</strong>
        </article>
        <article className="panel">
          <span className="muted">Announcements</span>
          <strong className="block text-2xl">Ready to send</strong>
        </article>
        <article className="panel">
          <span className="muted">Message History</span>
          <strong className="block text-2xl">Available anytime</strong>
        </article>
      </div>

      {(isAdmin || isTeacher) && <AnnouncementForm />}
      <ChatBox />
    </section>
  );
};

export default Messages;
