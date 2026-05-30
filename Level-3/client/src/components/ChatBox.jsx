import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useSocket } from '../hooks/useSocket.js';

const ChatBox = () => {
  const { user } = useAuth();
  const { users, onlineUsers, messages, loadMessages, loadUsers, sendMessage } = useSocket();
  const [receiver, setReceiver] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (receiver) {
      loadMessages(receiver);
    }
  }, [loadMessages, receiver]);

  const visibleMessages = useMemo(() => {
    if (!receiver) return [];

    return messages.filter((item) => {
      const senderId = item.sender?._id || item.sender;
      const receiverId = item.receiver?._id || item.receiver;
      return (
        (senderId === user._id && receiverId === receiver) ||
        (senderId === receiver && receiverId === user._id)
      );
    });
  }, [messages, receiver, user._id]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!receiver || !message.trim()) return;

    sendMessage({ receiver, message });
    setMessage('');
  };

  return (
    <section className="panel grid gap-4">
      <div>
        <p className="eyebrow">Conversations</p>
        <h2 className="text-xl font-black">Messages</h2>
      </div>
      <label className="label">
        Recipient
        <select className="input" value={receiver} onChange={(event) => setReceiver(event.target.value)}>
          <option value="">Select user</option>
          {users.map((item) => (
            <option key={item._id} value={item._id}>
              {onlineUsers.includes(item._id) ? 'Online - ' : 'Away - '}
              {item.name} ({item.role})
            </option>
          ))}
        </select>
      </label>
      <div className="grid max-h-80 gap-2 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        {visibleMessages.length === 0 ? (
          <p className="muted text-sm">Choose a recipient and start a conversation.</p>
        ) : (
          visibleMessages.map((item) => {
            const mine = (item.sender?._id || item.sender) === user._id;
            return (
              <div className={`max-w-[80%] rounded-2xl p-3 ${mine ? 'ml-auto bg-blue-600 text-white' : 'bg-white dark:bg-slate-900'}`} key={item._id || item.createdAt}>
                <p>{item.message}</p>
                <small className={mine ? 'text-blue-100' : 'text-slate-400'}>
                  {new Date(item.createdAt).toLocaleTimeString()}
                </small>
              </div>
            );
          })
        )}
      </div>
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <input className="input" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type a message" />
        <button className="btn-primary" type="submit">Send</button>
      </form>
    </section>
  );
};

export default ChatBox;
