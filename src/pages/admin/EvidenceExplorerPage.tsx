import React, { useMemo, useState } from 'react';
import {
  evidenceRecords,
  getParameterById,
  getProjectById,
  getBusinessUnitById,
  getSubsidiaryById,
  formatFileSize,
  formatDateTime
} from '../../data/mockData';
import { Evidence } from '../../types';
import { ProjectUserEvidence } from '../../types/projectUser';
import EvidenceDetailDrawer from '../../components/evidence/EvidenceDetailDrawer';
import { getAdminEvidence } from '../../services/adminDemoDataService';
import { subsidiaries as seedSubsidiaries } from '../../data/mockData';
import { readStoredValue } from '../../services/localStorageService';
import {
  FileSearch,
  Search,
  Filter,
  Eye,
  Download,
  ShieldCheck,
  Hash,
  ExternalLink,
  Layers
} from 'lucide-react';

export default function EvidenceExplorerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSub, setSelectedSub] = useState<string>('ALL');
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | ProjectUserEvidence | null>(null);
  const storedEvidence = useMemo(() => getAdminEvidence(), []);
  const storedSubsidiaries = readStoredValue<typeof seedSubsidiaries>('meil_subsidiaries', []);
  const subsidiaryOptions = useMemo(() => [...seedSubsidiaries, ...storedSubsidiaries].filter((item,index,all)=>all.findIndex(other=>other.id===item.id)===index), [storedSubsidiaries]);

  const filtered = useMemo(() => [...evidenceRecords, ...storedEvidence].filter((e, index, all) => all.findIndex(other => other.evidenceId === e.evidenceId) === index).filter(e => {
    const term = searchTerm.toLowerCase();
    const param = getParameterById(e.parameterId);
    const prj = getProjectById(e.projectId);
    const matchesSearch =
      e.evidenceId.toLowerCase().includes(term) ||
      e.systemFilename.toLowerCase().includes(term) ||
      e.originalFilename.toLowerCase().includes(term) ||
      (param?.name.toLowerCase().includes(term) ?? false) ||
      (prj?.name.toLowerCase().includes(term) ?? false);

    const matchesSub = selectedSub === 'ALL' || e.subsidiaryId === selectedSub;
    return matchesSearch && matchesSub;
  }), [storedEvidence, searchTerm, selectedSub]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Group Evidence Explorer & Master Vault</h1>
        <p className="text-sm text-navy-500 mt-1">
          Cryptographically indexed repository of all fuel slips, utility invoices, calibration certificates, and weighbridge slips
        </p>
      </div>

      {/* Collision-safe banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-esg-500/20 text-esg-400 flex items-center justify-center flex-shrink-0">
          <Hash size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Universal Collision-Safe File System Architecture</h3>
          <p className="text-xs text-navy-200 mt-1 leading-relaxed">
            All evidentiary artifacts are saved using standard scheme:
            <code className="text-esg-300 font-mono text-[11px] bg-white/10 px-2 py-0.5 rounded mx-1">
              [SUB]_[BU]_[PRJ]_[PARAM]_[YYYYMM]_[SEQ]_[HASH].[EXT]
            </code>
            This guarantees zero overwriting and enables instant reverse lineage lookups from consolidated statutory tables.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="search-panel">
        <div className="relative w-full sm:max-w-lg">
          <Search size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="search"
            aria-label="Search evidence files"
            placeholder="Search ID, filename, parameter, or site"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field pl-10"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedSub}
            onChange={(e) => setSelectedSub(e.target.value)}
            className="input-field min-w-52"
          >
            <option value="ALL">All Subsidiaries</option>
            {subsidiaryOptions.map(sub=><option key={sub.id} value={sub.id}>{sub.name}</option>)}
          </select>
          <div className="text-xs text-navy-400 whitespace-nowrap">
            Showing <span className="font-bold text-navy-800">{filtered.length}</span> documents
          </div>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-navy-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Evidence ID</th>
                <th className="py-3.5 px-4">System Vault Filename</th>
                <th className="py-3.5 px-4">Original Filename</th>
                <th className="py-3.5 px-4">Site / Project</th>
                <th className="py-3.5 px-4">ESG Parameter</th>
                <th className="py-3.5 px-4">File Size</th>
                <th className="py-3.5 px-4">Uploaded</th>
                <th className="py-3.5 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(ev => {
                const param = getParameterById(ev.parameterId);
                const prj = getProjectById(ev.projectId);

                return (
                  <tr key={ev.evidenceId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                      {ev.evidenceId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] text-esg-800 font-semibold block truncate max-w-[220px]" title={ev.systemFilename}>
                        {ev.systemFilename}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-navy-600 truncate max-w-[160px]" title={ev.originalFilename}>
                      {ev.originalFilename}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-navy-900">{prj?.name || ev.projectId}</td>
                    <td className="py-3.5 px-4 text-navy-700">
                      {param ? param.name : ev.parameterId}
                    </td>
                    <td className="py-3.5 px-4 text-navy-500">
                      {formatFileSize(ev.fileSize)}
                    </td>
                    <td className="py-3.5 px-4 text-navy-400">
                      {formatDateTime(ev.uploadedAt).split(' ')[0]}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedEvidence(ev)}
                        className="btn-secondary btn-sm inline-flex items-center gap-1 text-[11px] py-1 px-3"
                      >
                        <Eye size={12} /> Inspect
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
