import React, { useState } from 'react';
import {
  auditEvents,
  getUserById,
  formatDateTime
} from '../../data/mockData';
import { Shield, Search, Filter, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function VerificationHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter verification-related audit events
  const verificationLogs = auditEvents.filter(
    e => e.action.includes('VERIF') || e.action.includes('CORRECTION') || e.action.includes('CONSOLIDAT')
  );

  const filtered = verificationLogs.filter(e => {
    const term = searchTerm.toLowerCase();
    return (
      e.action.toLowerCase().includes(term) ||
      e.details.toLowerCase().includes(term) ||
      e.id.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Project Verification Audit History</h1>
          <p className="text-sm text-navy-500 mt-1">
            Immutable log of supervisor approvals, correction notices, and batch seal transactions
          </p>
        </div>
      </div>

      <div className="search-panel">
        <div className="relative w-full sm:max-w-md">
          <Search size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="search"
            aria-label="Search verification history"
            placeholder="Search action, user, or details"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field pl-10"
          />
        </div>
        <div className="text-xs text-navy-400">
          Total Logged Transactions: <span className="font-bold text-navy-800">{filtered.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-navy-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Event ID</th>
                <th className="py-3.5 px-4">Action Type</th>
                <th className="py-3.5 px-4">Entity Type</th>
                <th className="py-3.5 px-4">Target Ref</th>
                <th className="py-3.5 px-4">Supervisor / Actor</th>
                <th className="py-3.5 px-4">Audit Description</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(log => {
                const actor = getUserById(log.userId);
                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-800">
                      {log.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes('CORRECTION')
                          ? 'bg-rose-100 text-rose-800'
                          : log.action.includes('VERIF')
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-navy-700">
                      {log.entityType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-navy-800 font-semibold">
                      {log.entityId}
                    </td>
                    <td className="py-3.5 px-4 text-navy-700">
                      {actor?.name || log.userId}
                    </td>
                    <td className="py-3.5 px-4 text-navy-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 text-right text-navy-400">
                      {formatDateTime(log.timestamp)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
