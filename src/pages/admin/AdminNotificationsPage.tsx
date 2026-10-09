import React, { useState } from 'react';
import { notifications as initialNotifications, formatDateTime } from '../../data/mockData';
import { Bell, AlertTriangle, CheckCircle2, Info, Clock, Check, Send } from 'lucide-react';

export default function AdminNotificationsPage() {
  const [items, setItems] = useState(initialNotifications);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      userId: 'ALL',
      title: broadcastTitle,
      message: broadcastMsg,
      type: 'INFO' as const,
      createdAt: new Date().toISOString(),
      read: false
    };
    setItems([newNotif, ...items]);
    setBroadcastModal(false);
    setBroadcastTitle('');
    setBroadcastMsg('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Admin Notification Center & Alerts</h1>
          <p className="text-sm text-navy-500 mt-1">
            System notices, statutory deadline warnings, and compliance broadcast communications
          </p>
        </div>

        <button
          onClick={() => setBroadcastModal(true)}
          className="btn-primary flex items-center gap-1.5 self-start text-xs font-semibold py-2.5 px-4"
        >
          <Send size={14} /> Send Group Broadcast
        </button>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div
            key={item.id}
            className="p-4 rounded-xl border bg-white border-slate-200 shadow-sm flex items-start gap-4"
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
            </div>
          </div>
        ))}
      </div>

      {broadcastModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-navy-900">Send ESG Compliance Broadcast</h3>
            <p className="text-xs text-navy-500">
              Dispatches an immediate high-priority alert to all site engineers and supervisors.
            </p>
            <form onSubmit={handleBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 SEBI BRSR Consolidation Deadline"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="input-field w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="All site officers must upload certified diesel and grid vouchers by Oct 15..."
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  className="input-field w-full text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBroadcastModal(false)}
                  className="btn-secondary btn-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-sm text-xs font-semibold"
                >
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
