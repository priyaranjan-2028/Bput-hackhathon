import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notificationService';
import { formatDisplayDate } from '../../utils/dateUtils';
import { Bell, CheckCheck, Info, ShieldAlert } from 'lucide-react';

export default function ProjectUserNotificationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [refresh, setRefresh] = useState(0);
  void refresh;
  if (!user) return null;
  const notifications = getUserNotifications(user.id);
  const visible = notifications.filter(item => filter === 'all' || !item.read);
  const markRead = (id: string) => {
    markNotificationRead(user.id, id);
    setRefresh(value => value + 1);
  };
  const markAllRead = () => {
    markAllNotificationsRead(user.id);
    setRefresh(value => value + 1);
  };
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Project User workspace</p><h1 className="mt-1 text-2xl font-bold text-navy-900">Notifications</h1><p className="mt-1 text-sm text-slate-600">Submission updates, correction requests and project workflow alerts.</p></div><button type="button" onClick={markAllRead} disabled={!notifications.some(item => !item.read)} className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"><CheckCheck size={16} /> Mark all as read</button></header>
      <nav className="flex gap-2 border-b border-slate-200 pb-3" aria-label="Notification filters"><button type="button" onClick={() => setFilter('all')} aria-pressed={filter === 'all'} className={`rounded-lg px-3 py-2 text-sm font-medium ${filter === 'all' ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>All ({notifications.length})</button><button type="button" onClick={() => setFilter('unread')} aria-pressed={filter === 'unread'} className={`rounded-lg px-3 py-2 text-sm font-medium ${filter === 'unread' ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Unread ({notifications.filter(item => !item.read).length})</button></nav>
      {visible.length ? <ul className="space-y-3">{visible.map(item => {
        const isCorrection = /correction/i.test(`${item.title} ${item.message}`);
        const destination = isCorrection ? '/corrections' : item.submissionId ? `/submissions/${encodeURIComponent(item.submissionId)}` : '/submissions';
        return <li key={item.notificationId} className={`rounded-xl border p-4 ${item.read ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50/50'}`}>
          <div className="flex items-start gap-3"><span className={`rounded-lg p-2 ${isCorrection ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>{isCorrection ? <ShieldAlert size={18} /> : <Info size={18} />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold text-navy-900">{item.title}</h2><time className="text-xs text-slate-500">{formatDisplayDate(item.createdAt.slice(0, 10))}</time></div><p className="mt-1 text-sm text-slate-700">{item.message}</p><div className="mt-3 flex items-center gap-4"><Link to={destination} onClick={() => !item.read && markRead(item.notificationId)} className="text-sm font-semibold text-blue-700 hover:underline">{isCorrection ? 'View correction' : 'View submission'}</Link>{!item.read && <button type="button" onClick={() => markRead(item.notificationId)} className="text-xs font-medium text-slate-600 hover:underline">Mark read</button>}</div></div></div>
        </li>;
      })}</ul> : <div className="rounded-xl border border-slate-200 bg-white p-10 text-center"><Bell size={30} className="mx-auto text-slate-400" /><h2 className="mt-3 font-semibold text-navy-900">You’re all caught up</h2><p className="mt-1 text-sm text-slate-600">New submission and supervisor updates will be listed here.</p></div>}
    </div>
  );
}
