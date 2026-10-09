import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNotificationsByUser, formatDate, formatDateTime, notifications as allNotifications } from '../../data/mockData';
import { Bell, CheckCircle2, AlertTriangle, Info, Clock, Check, Trash2, Filter } from 'lucide-react';
import { readStoredValue, writeStoredValue } from '../../services/localStorageService';
import { Notification } from '../../types';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>(() => {
    const stored = readStoredValue<Notification[]>('meil_notifications', []).filter(item => !user || item.userId === user.id);
    const seeded = user ? getNotificationsByUser(user.id) : allNotifications;
    return [...stored, ...seeded].filter((item, index, all) => all.findIndex(other => other.id === item.id) === index);
  });
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filteredItems = items.filter(n => filter === 'ALL' || !n.read);

  const markAsRead = (id: string) => {
    setItems(prev => { const next = prev.map(n => n.id === id ? { ...n, read: true } : n); persist(next); return next; });
  };

  const markAllRead = () => {
    setItems(prev => { const next = prev.map(n => ({ ...n, read: true })); persist(next); return next; });
  };

  const clearAll = () => {
    setItems([]);
    if (user) writeStoredValue('meil_notifications', readStoredValue<Notification[]>('meil_notifications', []).filter(item => item.userId !== user.id));
  };

  const persist = (next: Notification[]) => {
    if (!user) return;
    const all = readStoredValue<Notification[]>('meil_notifications', []);
    const mapped = new Map(next.map(item => [item.id, item]));
    writeStoredValue('meil_notifications', [...all.filter(item => item.userId !== user.id), ...mapped.values()]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">System Notifications & Action Alerts</h1>
          <p className="text-sm text-navy-500 mt-1">
            Tracking ESG workflow submissions, review approvals, corrections, and consolidation updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            disabled={items.every(n => n.read)}
            className="btn-secondary btn-sm flex items-center gap-1.5 text-xs"
          >
            <Check size={14} /> Mark All Read
          </button>
          <button
            onClick={clearAll}
            disabled={items.length === 0}
            className="btn-ghost btn-sm flex items-center gap-1.5 text-xs text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'ALL' ? 'bg-navy-800 text-white' : 'text-navy-600 hover:bg-slate-100'
          }`}
        >
          All Notifications ({items.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'UNREAD' ? 'bg-navy-800 text-white' : 'text-navy-600 hover:bg-slate-100'
          }`}
        >
          Unread ({items.filter(n => !n.read).length})
        </button>
      </div>

      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Bell size={36} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-navy-800">No Notifications</h3>
            <p className="text-xs text-navy-400 mt-1">You are completely up to date with your ESG workflow items.</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                item.read
                  ? 'bg-white border-slate-200 text-navy-700 opacity-80'
                  : 'bg-emerald-50/40 border-esg-200 text-navy-900 shadow-sm'
              }`}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${
                item.type === 'CORRECTION_REQUESTED'
                  ? 'bg-amber-100 text-amber-700'
                  : item.type === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {item.type === 'CORRECTION_REQUESTED' ? (
                  <AlertTriangle size={18} />
                ) : item.type === 'VERIFIED' ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Info size={18} />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-navy-900">{item.title}</h4>
                  <span className="text-[11px] text-navy-400 flex items-center gap-1">
                    <Clock size={12} /> {formatDateTime(item.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-navy-600 mt-1 leading-relaxed">{item.message}</p>
                {item.entityType && item.entityId && (
                  <div className="mt-2 text-[11px] font-mono text-navy-400">
                    Ref: {item.entityType} #{item.entityId}
                  </div>
                )}
              </div>

              {!item.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-esg-500 self-center flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
