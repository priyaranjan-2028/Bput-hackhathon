import React, { useState } from 'react';
import {
  evidenceRecords,
  getParameterById,
  projects,
  users,
  formatFileSize,
  formatDateTime
} from '../../data/mockData';
import { Evidence } from '../../types';
import EvidenceDetailDrawer from '../../components/evidence/EvidenceDetailDrawer';
import { FileSearch, Search, Filter, Eye, Download, ShieldCheck, Check, Clock } from 'lucide-react';

export default function EvidenceReviewPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const filtered = evidenceRecords.filter(e => {
    const term = searchTerm.toLowerCase();
    const param = getParameterById(e.parameterId);
    return (
      e.evidenceId.toLowerCase().includes(term) ||
      e.systemFilename.toLowerCase().includes(term) ||
      e.originalFilename.toLowerCase().includes(term) ||
      param?.name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Project Evidentiary Audit Vault</h1>
          <p className="text-sm text-navy-500 mt-1">
            Examine cryptographic hashes, timestamps, and source documents for site submissions
          </p>
        </div>
      </div>

      <div className="search-panel">
        <div className="relative w-full sm:max-w-md">
          <Search size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="search"
            aria-label="Search evidence review"
            placeholder="Search ID, system filename, or parameter"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field pl-10"
          />
        </div>
        <div className="text-xs text-navy-400">
          Total Vault Documents: <span className="font-bold text-navy-800">{filtered.length} files</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-navy-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Evidence ID</th>
                <th className="py-3.5 px-4">System File Identification</th>
                <th className="py-3.5 px-4">ESG Parameter</th>
                <th className="py-3.5 px-4">File Size</th>
                <th className="py-3.5 px-4">Hash (SHA-256)</th>
                <th className="py-3.5 px-4">Uploaded</th>
                <th className="py-3.5 px-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(ev => {
                const param = getParameterById(ev.parameterId);
                return (
                  <tr key={ev.evidenceId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                      {ev.evidenceId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[11px] text-esg-800 font-semibold truncate max-w-[240px]" title={ev.systemFilename}>
                        {ev.systemFilename}
                      </div>
                      <div className="text-[10px] text-navy-400 truncate max-w-[200px]">
                        Original: {ev.originalFilename}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-navy-900">
                      {param ? param.name : ev.parameterId}
                    </td>
                    <td className="py-3.5 px-4 text-navy-600">
                      {formatFileSize(ev.fileSize)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 truncate max-w-[140px]" title={ev.fileHash}>
                      {ev.fileHash}
                    </td>
                    <td className="py-3.5 px-4 text-navy-400">
                      {formatDateTime(ev.uploadedAt).split(' ')[0]}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedEvidence(ev)}
                        className="btn-secondary btn-sm inline-flex items-center gap-1 text-[11px] py-1 px-3"
                      >
                        <Eye size={12} /> Inspect File
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEvidence && (
        <EvidenceDetailDrawer
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
        />
      )}
    </div>
  );
}
