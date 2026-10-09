import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserEvidence } from '../../services/evidenceService';
import { getParameterById } from '../../data/mockData';
import { formatDisplayDate } from '../../utils/dateUtils';
import { FileSearch, UploadCloud } from 'lucide-react';

export default function ProjectEvidencePage() {
  const { user } = useAuth();
  if (!user) return null;
  const evidence = getUserEvidence(user.id).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Project User workspace</p><h1 className="mt-1 text-2xl font-bold text-navy-900">Evidence Records</h1><p className="mt-1 text-sm text-slate-600">Evidence metadata and system identities associated with your submissions.</p></div><Link to="/section-c/scope-1" className="btn-primary inline-flex items-center gap-2"><UploadCloud size={16} /> Add evidence through data entry</Link></header>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-navy-900">Evidence history <span className="ml-1 text-sm font-normal text-slate-500">({evidence.length})</span></h2></div>
        {evidence.length ? <div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Evidence ID</th><th className="px-4 py-3">Parameter</th><th className="px-4 py-3">Original Filename</th><th className="px-4 py-3">System Filename</th><th className="px-4 py-3">File</th><th className="px-4 py-3">Uploaded</th><th className="px-4 py-3">Submission</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{evidence.map(item => <tr key={item.evidenceId}><td className="px-4 py-3 font-mono text-xs font-semibold text-navy-900">{item.evidenceId}</td><td className="px-4 py-3">{getParameterById(item.parameterId)?.name ?? item.parameterId}</td><td className="px-4 py-3">{item.originalFilename}</td><td className="max-w-xs break-all px-4 py-3 font-mono text-xs text-slate-600">{item.systemFilename}</td><td className="px-4 py-3">{item.fileExtension.toUpperCase()} · {(item.fileSize / 1024).toFixed(1)} KB</td><td className="px-4 py-3">{formatDisplayDate(item.uploadedAt.slice(0, 10))}</td><td className="px-4 py-3">{item.submissionId ? <Link className="text-blue-700 hover:underline" to={`/submissions/${encodeURIComponent(item.submissionId)}`}>{item.submissionId}</Link> : 'Not submitted'}</td></tr>)}</tbody>
        </table></div> : <div className="p-10 text-center"><FileSearch size={30} className="mx-auto text-slate-400" /><h2 className="mt-3 font-semibold text-navy-900">No evidence uploaded yet</h2><p className="mt-1 text-sm text-slate-600">Evidence is added from a Section C data-entry workflow so each file stays linked to its parameter.</p><Link to="/section-c/scope-1" className="mt-4 inline-flex font-semibold text-blue-700 hover:underline">Open Scope 1 data entry</Link></div>}
      </section>
    </div>
  );
}
