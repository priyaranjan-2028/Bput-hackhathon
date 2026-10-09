import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProjectById, getParameterById, getBusinessUnitById, getSubsidiaryById } from '../../data/mockData';
import { deleteDraft, getUserSubmissions } from '../../services/submissionService';
import { getUserEvidence } from '../../services/evidenceService';
import { ProjectUserSubmission } from '../../types/projectUser';
import { SubmissionStatus } from '../../types';
import ProjectUserStatusBadge from '../../components/project-user/StatusBadge';
import { formatDisplayDate } from '../../utils/dateUtils';
import { ArrowLeft, Search } from 'lucide-react';

const dateTime = (value?: string) => value
  ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : '—';

export default function MySubmissionsPage() {
  const { user } = useAuth();
  const { submissionId } = useParams();
  const project = user?.projectId ? getProjectById(user.projectId) : undefined;
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportingPeriod, setReportingPeriod] = useState('ALL');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  void refreshKey;
  const submissions = user && project ? getUserSubmissions(user.id, project.id) : [];
  const evidence = user ? getUserEvidence(user.id) : [];

  const filtered = useMemo(() => submissions.filter(item => {
    const parameter = getParameterById(item.parameterId);
    const searchMatch = `${item.submissionId} ${item.parameterId} ${parameter?.name ?? ''}`.toLowerCase().includes(query.toLowerCase());
    return searchMatch
      && (statusFilter === 'ALL' || item.status === statusFilter)
      && (scopeFilter === 'ALL' || item.scope === scopeFilter)
      && (!startDate || item.dataEntryDate >= startDate)
      && (!endDate || item.dataEntryDate <= endDate)
      && (reportingPeriod === 'ALL' || item.reportingPeriod === reportingPeriod);
  }), [submissions, query, statusFilter, scopeFilter, startDate, endDate, reportingPeriod]);

  if (!user) return null;
  if (submissionId) {
    const submission = submissions.find(item => item.submissionId === submissionId);
    if (!submission) return <div className="rounded-xl border border-slate-200 bg-white p-8"><h1 className="text-xl font-bold text-navy-900">Submission not found</h1><p className="mt-2 text-sm text-slate-600">This record is unavailable or does not belong to your account.</p><Link className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:underline" to="/submissions">Return to My Submissions</Link></div>;
    return <SubmissionDetails submission={submission} evidence={evidence} />;
  }

  const removeDraft = (submission: ProjectUserSubmission) => {
    if (submission.status !== SubmissionStatus.DRAFT) {
      setError('Only draft records can be deleted.');
      return;
    }
    try {
      deleteDraft(user.id, submission.submissionId);
      setNotice('Draft deleted.');
      setError('');
      setRefreshKey(value => value + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update the draft.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Project User workspace</p><h1 className="mt-1 text-2xl font-bold text-navy-900">My Submissions</h1><p className="mt-1 text-sm text-slate-600">Review your drafts, submitted records, evidence and verification outcomes.</p></header>
      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6" aria-label="Submission filters">
        <label className="relative sm:col-span-2"><span className="sr-only">Search submissions</span><Search size={17} className="absolute left-3.5 top-3.5 text-slate-400" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} className="search-field pl-10" placeholder="Search submission or parameter" /></label>
        <label className="text-xs text-slate-600">Status<select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="input-field mt-1 w-full"><option value="ALL">All statuses</option>{Object.values(SubmissionStatus).map(status => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label>
        <label className="text-xs text-slate-600">Section<select value={scopeFilter} onChange={event => setScopeFilter(event.target.value)} className="input-field mt-1 w-full"><option value="ALL">All sections</option><option value="SCOPE_1">Scope 1</option><option value="SCOPE_2">Scope 2</option><option value="SCOPE_3">Scope 3</option><option value="SECTION_C">Other Section C</option></select></label>
        <label className="text-xs text-slate-600">Reporting period<select value={reportingPeriod} onChange={event => setReportingPeriod(event.target.value)} className="input-field mt-1 w-full"><option value="ALL">All periods</option>{Array.from(new Set(submissions.map(item => item.reportingPeriod))).map(period => <option key={period} value={period}>{period}</option>)}</select></label>
        <label className="text-xs text-slate-600">From date<input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} className="input-field mt-1 w-full" /></label>
        <label className="text-xs text-slate-600">To date<input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} className="input-field mt-1 w-full" /></label>
      </section>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-navy-900">Submission history <span className="ml-1 text-sm font-normal text-slate-500">({filtered.length})</span></h2></div>
        {filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Submission ID</th><th className="px-4 py-3">Data Entry Date</th><th className="px-4 py-3">Parameter / Section</th><th className="px-4 py-3">Activity Data</th><th className="px-4 py-3">CO₂e</th><th className="px-4 py-3">Evidence</th><th className="px-4 py-3">Submitted At</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{filtered.map(item => {
            const parameter = getParameterById(item.parameterId);
            const canCorrect = item.status === SubmissionStatus.CORRECTION_REQUIRED || item.status === SubmissionStatus.CORRECTION_REQUESTED;
            return <tr key={item.submissionId}>
              <td className="px-4 py-3 font-mono text-xs font-semibold text-navy-800">{item.submissionId}</td>
              <td className="px-4 py-3">{formatDisplayDate(item.dataEntryDate)}</td>
              <td className="px-4 py-3"><p className="font-medium text-navy-900">{parameter?.name ?? item.parameterId}</p><p className="text-xs text-slate-500">{item.scope.replaceAll('_', ' ')}</p></td>
              <td className="px-4 py-3">{item.activityValue.toLocaleString()} {item.activityUnit}</td>
              <td className="px-4 py-3">{item.calculation ? `${item.calculation.convertedTonnesCO2e.toFixed(3)} t` : '—'}</td>
              <td className="px-4 py-3">{item.evidenceIds.length}</td><td className="px-4 py-3 text-xs">{dateTime(item.submittedAt)}</td>
              <td className="px-4 py-3"><ProjectUserStatusBadge status={item.status} /></td>
              <td className="px-4 py-3"><div className="flex items-center gap-3"><Link className="font-medium text-blue-700 hover:underline" to={`/submissions/${encodeURIComponent(item.submissionId)}`}>View</Link>{canCorrect && <Link className="font-medium text-orange-700 hover:underline" to="/corrections">Correct</Link>}{item.status === SubmissionStatus.DRAFT && <><Link className="font-medium text-blue-700 hover:underline" to={`/section-c/${item.scope === 'SCOPE_1' ? 'scope-1' : item.scope === 'SCOPE_2' ? 'scope-2' : item.scope === 'SCOPE_3' ? 'scope-3' : 'other'}?draft=${encodeURIComponent(item.submissionId)}`}>Edit</Link><button type="button" onClick={() => removeDraft(item)} className="font-medium text-rose-700 hover:underline">Delete</button></>}</div></td>
            </tr>;
          })}</tbody>
        </table></div> : <div className="p-10 text-center"><ClipboardListFallback /><h3 className="mt-3 font-semibold text-navy-900">No submissions match these filters</h3><p className="mt-1 text-sm text-slate-600">Try changing the filters or start a new Section C entry.</p><Link to="/section-c/scope-1" className="mt-4 inline-flex font-semibold text-blue-700 hover:underline">Start a data entry</Link></div>}
      </section>
    </div>
  );
}

function SubmissionDetails({ submission, evidence }: { submission: ProjectUserSubmission; evidence: ReturnType<typeof getUserEvidence> }) {
  const parameter = getParameterById(submission.parameterId);
  const linkedEvidence = evidence.filter(item => submission.evidenceIds.includes(item.evidenceId));
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link to="/submissions" className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"><ArrowLeft size={16} /> Back to My Submissions</Link>
      <header><p className="font-mono text-xs text-slate-500">{submission.submissionId}</p><h1 className="mt-1 text-2xl font-bold text-navy-900">Submission details</h1><div className="mt-2"><ProjectUserStatusBadge status={submission.status} /></div></header>
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Parameter" value={parameter?.name ?? submission.parameterId} /><Detail label="Section" value={submission.scope.replaceAll('_', ' ')} /><Detail label="Project" value={getProjectById(submission.projectId)?.name ?? submission.projectId} /><Detail label="Business Unit" value={getBusinessUnitById(submission.businessUnitId)?.name ?? submission.businessUnitId} /><Detail label="Subsidiary" value={getSubsidiaryById(submission.subsidiaryId)?.name ?? submission.subsidiaryId} /><Detail label="Reporting Period" value={submission.reportingPeriod} /><Detail label="Data Entry Date" value={formatDisplayDate(submission.dataEntryDate)} /><Detail label="Activity Data" value={`${submission.activityValue.toLocaleString()} ${submission.activityUnit}`} /><Detail label="Submitted At" value={dateTime(submission.submittedAt)} />
      </section>
      {submission.supervisorNotes && <section className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-semibold text-amber-900">Supervisor comment</h2><p className="mt-2 text-sm text-amber-900">{submission.supervisorNotes}</p></section>}
      <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-navy-900">Calculation</h2>{submission.calculation ? <dl className="mt-3 grid gap-3 sm:grid-cols-2"><Detail label="Emission factor" value={`${submission.calculation.emissionFactorValue} ${submission.calculation.emissionFactorUnit}`} /><Detail label="Emission Factor ID" value={submission.calculation.emissionFactorId} /><Detail label="Formula" value={submission.calculation.formula} /><Detail label="Raw result" value={`${submission.calculation.rawKgCO2e.toLocaleString()} kgCO₂e`} /><Detail label="Converted CO₂e" value={`${submission.calculation.convertedTonnesCO2e.toFixed(3)} tCO₂e`} /></dl> : <p className="mt-2 text-sm text-slate-600">This indicator does not have a CO₂e calculation.</p>}</section>
      <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-navy-900">Supporting evidence</h2>{linkedEvidence.length ? <ul className="mt-3 space-y-3">{linkedEvidence.map(file => <li key={file.evidenceId} className="rounded-lg bg-slate-50 p-3"><p className="text-sm font-medium text-navy-900">{file.originalFilename}</p><p className="mt-1 break-all font-mono text-xs text-slate-600">{file.systemFilename}</p><p className="mt-1 text-xs text-slate-500">{file.evidenceId} · {(file.fileSize / 1024).toFixed(1)} KB</p></li>)}</ul> : <p className="mt-2 text-sm text-slate-600">No evidence is attached.</p>}</section>
      <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-navy-900">Verification history</h2>{submission.verificationHistory.length ? <ol className="mt-3 space-y-3">{submission.verificationHistory.map(item => <li key={item.verificationId} className="border-l-2 border-blue-200 pl-4"><p className="font-medium text-navy-900">{item.action} · {item.status.replaceAll('_', ' ')}</p><p className="text-sm text-slate-600">{item.comment}</p><p className="text-xs text-slate-500">{item.verifiedBy} · {dateTime(item.timestamp)}</p></li>)}</ol> : <p className="mt-2 text-sm text-slate-600">No verification activity yet.</p>}</section>
      <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-navy-900">Remarks</h2><p className="mt-2 text-sm text-slate-600">{submission.remarks || 'No remarks supplied.'}</p></section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-sm font-medium text-navy-900">{value}</dd></div>;
}

function ClipboardListFallback() {
  return <span aria-hidden="true" className="mx-auto block h-10 w-10 rounded-full bg-slate-100" />;
}
