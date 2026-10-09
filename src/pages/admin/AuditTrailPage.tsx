import React, { useState } from 'react';
import { auditEvents, getUserById, formatDateTime } from '../../data/mockData';
import { Shield, Search, Filter, Download, CheckCircle2, Clock } from 'lucide-react';

export default function AuditTrailPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filtered = auditEvents.filter(e => {
    const matchesSearch =
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.entityId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'ALL' || e.action.includes(filterAction);
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Comprehensive ESG Audit Trail & Event Ledger</h1>
          <p className="text-sm text-navy-500 mt-1">
            Immutable log of all field transactions, verification events, and consolidation seals for statutory auditor inspection
          </p>
        </div>
        <button
          onClick={() => alert('Exporting signed audit package...')}
          className="btn-secondary btn-sm flex items-center gap-1.5 self-start text-xs font-semibold py-2 px-3"
        >
          <Download size={14} /> Export Audit Log (CSV)
        </button>
      </div>

      <div className="search-panel">
        <div className="relative w-full sm:max-w-md">
          <Search size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="search"
            aria-label="Search audit events"
            placeholder="Search audit ID, actor, or details"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field pl-10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'SUBMIT', 'VERIF', 'CONSOLIDAT', 'EVIDENCE'].map(act => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterAction === act
                  ? 'bg-navy-800 text-white'
                  : 'bg-slate-100 text-navy-600 hover:bg-slate-200'
              }`}
            >
              {act === 'ALL' ? 'All Events' : act}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-navy-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Event ID</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity Type</th>
                <th className="py-3.5 px-4">Entity Target</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Audit Description</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(log => {
                const actor = getUserById(log.userId);
                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-900">{log.id}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-100 text-navy-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-navy-700">{log.entityType}</td>
                    <td className="py-3.5 px-4 font-mono text-navy-800 font-semibold">{log.entityId}</td>
                    <td className="py-3.5 px-4 text-navy-800 font-medium">{actor?.name || log.userId}</td>
                    <td className="py-3.5 px-4 text-navy-600 max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 text-right text-navy-400">{formatDateTime(log.timestamp)}</td>
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
