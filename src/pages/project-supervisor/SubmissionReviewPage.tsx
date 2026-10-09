import React, { useState } from 'react';
import {
  parameterSubmissions as initialSubs,
  evidenceRecords,
  getParameterById,
  getUserById,
  formatDateTime,
  projects,
  users,
} from '../../data/mockData';
import { SubmissionStatus, ParameterSubmission, UserRole, User, VerificationAction } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import { readStoredValue, writeStoredValue, MEIL_STORAGE_KEYS } from '../../services/localStorageService';
import { ProjectUserEvidence, ProjectUserSubmission } from '../../types/projectUser';
import { useAuth } from '../../context/AuthContext';
import { getBusinessUnitProjects } from '../../services/businessUnitService';
import EvidenceFileLink from '../../components/evidence/EvidenceFileLink';
import {
  CheckCircle2,
  AlertTriangle,
  Eye,
  Check,
  X,
  FileCheck,
  ShieldCheck,
  Clock,
  MessageSquare
} from 'lucide-react';

export default function SubmissionReviewPage() {
  const { user: supervisor } = useAuth();
  const projectList = getBusinessUnitProjects(supervisor?.businessUnitId || 'BU001');
  const projectId = supervisor?.assignedProjectIds?.[0] ?? projectList[0]?.id ?? projects[0]?.id;
  const project = projectList.find(item => item.id === projectId) ?? projects.find(item => item.id === projectId);
  const [refresh, setRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'VERIFIED' | 'CORRECTIONS'>('PENDING');
  const [selectedSubForCorrection, setSelectedSubForCorrection] = useState<ParameterSubmission | null>(null);
  const [correctionNote, setCorrectionNote] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('ALL');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const legacySubmissions = readStoredValue<ParameterSubmission[]>('meil_supervisor_submissions', initialSubs);
  const projectLegacySubmissions = legacySubmissions.filter(submission => submission.projectId === projectId);
  const projectUserSubmissions = readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions, []).filter(submission => submission.projectId === projectId);
  const projectUsers = [...users, ...readStoredValue<User[]>('meil_project_users', [])].filter(user => user.role === UserRole.PROJECT_USER && user.projectId === projectId).filter((user, index, all) => all.findIndex(other => other.id === user.id) === index);
  const evidence = [...evidenceRecords.filter(item => item.projectId === projectId), ...readStoredValue<ProjectUserEvidence[]>(MEIL_STORAGE_KEYS.evidence, []).filter(item => item.projectId === projectId)].filter((item, index, all) => all.findIndex(other => other.evidenceId === item.evidenceId) === index);
  const normalized = [
    ...projectLegacySubmissions.map(submission => ({ kind: 'legacy' as const, id: submission.id ?? submission.submissionId ?? '', parameterId: submission.parameterId, projectId: submission.projectId, userId: submission.userId ?? submission.submittedBy ?? '', value: submission.value ?? submission.activityData ?? 0, unit: submission.unit ?? '', calculatedCO2e: submission.calculatedCO2e ?? 0, period: submission.reportingPeriod ?? submission.period ?? '', status: submission.status, evidenceIds: submission.evidenceIds ?? [], notes: submission.notes ?? '', raw: submission })),
    ...projectUserSubmissions.map(submission => ({ kind: 'user' as const, id: submission.submissionId, parameterId: submission.parameterId, projectId: submission.projectId, userId: submission.userId, value: submission.activityValue, unit: submission.activityUnit, calculatedCO2e: submission.calculation?.convertedTonnesCO2e ?? 0, period: submission.reportingPeriod, status: submission.status, evidenceIds: submission.evidenceIds, notes: submission.remarks, raw: submission })),
  ].filter((submission, index, all) => all.findIndex(other => other.id === submission.id) === index);
  const submissions = normalized.filter(submission => selectedUserId === 'ALL' || submission.userId === selectedUserId);
  void refresh;

  const pendingSubmissions = submissions.filter(s => s.status === SubmissionStatus.SUBMITTED || s.status === SubmissionStatus.UNDER_REVIEW);
  const verifiedSubmissions = submissions.filter(s => s.status === SubmissionStatus.VERIFIED_LEVEL_1 || s.status === SubmissionStatus.CONSOLIDATED_PROJECT || s.status === SubmissionStatus.APPROVED);
  const correctionSubmissions = submissions.filter(s => s.status === SubmissionStatus.CORRECTION_REQUESTED || s.status === SubmissionStatus.CORRECTION_REQUIRED);

  const displayedList =
    activeTab === 'PENDING'
      ? pendingSubmissions
      : activeTab === 'VERIFIED'
      ? verifiedSubmissions
      : correctionSubmissions;

  const recordDecision = (item: (typeof normalized)[number], status: SubmissionStatus, comment: string) => {
    const now = new Date().toISOString();
    if (item.kind === 'legacy') {
      const all = readStoredValue<ParameterSubmission[]>('meil_supervisor_submissions', initialSubs);
      writeStoredValue('meil_supervisor_submissions', all.map(submission => (submission.id ?? submission.submissionId) === item.id ? { ...submission, status, supervisorNotes: comment, verifiedBy: supervisor.id, verifiedAt: now } : submission));
    } else {
      const all = readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions, []);
      const target = all.find(submission => submission.submissionId === item.id);
      if (target) {
        const history = { verificationId: `VER-${Date.now()}`, verifiedBy: supervisor.id, role: 'Project Supervisor', action: status === SubmissionStatus.VERIFIED_LEVEL_1 ? 'Verified at Level 1' : 'Correction requested', status, comment, timestamp: now };
        writeStoredValue(MEIL_STORAGE_KEYS.submissions, all.map(submission => submission.submissionId === item.id ? { ...submission, status, updatedAt: now, verificationHistory: [...(submission.verificationHistory ?? []), history] } : submission));
      }
      const allEvidence = readStoredValue<ProjectUserEvidence[]>(MEIL_STORAGE_KEYS.evidence, []);
      writeStoredValue(MEIL_STORAGE_KEYS.evidence, allEvidence.map(file => item.evidenceIds.includes(file.evidenceId) ? { ...file, verificationStatus: status } : file));
    }
    setRefresh(value => value + 1);
  };

  const handleApprove = (item: (typeof normalized)[number]) => {
    recordDecision(item, SubmissionStatus.VERIFIED_LEVEL_1, 'Submission and supporting evidence verified.');
    setNotification(`Submission ${item.id} successfully verified at Level 1.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRequestCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForCorrection) return;

    const target = normalized.find(item => item.id === (selectedSubForCorrection.id ?? selectedSubForCorrection.submissionId));
    if (target) recordDecision(target, SubmissionStatus.CORRECTION_REQUESTED, correctionNote);
    setNotification(`Correction notice issued for ${selectedSubForCorrection.id ?? selectedSubForCorrection.submissionId} with audit remarks.`);
    setSelectedSubForCorrection(null);
    setCorrectionNote('');
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Level-1 Submission Verification Desk</h1>
          <p className="text-sm text-navy-500 mt-1">
            Select a project user, inspect each submission and its supporting files together, then verify or return it for correction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-navy-100 text-navy-800">
            {project?.name ?? 'Assigned project'} · {supervisor.name}
          </span>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm shadow-sm animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <label className="w-full text-xs font-semibold text-navy-700 sm:max-w-sm">Project user<select value={selectedUserId} onChange={event => setSelectedUserId(event.target.value)} className="input-field mt-1 w-full"><option value="ALL">All project users</option>{projectUsers.map(user => <option key={user.id} value={user.id}>{user.name} · {user.email}</option>)}</select></label>
        <p className="text-xs text-slate-500">{submissions.length} submission(s) for {project?.name ?? 'this project'}</p>
      </section>

      {/* Verification Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PENDING'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white text-navy-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock size={14} /> Pending Verification ({pendingSubmissions.length})
        </button>

        <button
          onClick={() => setActiveTab('VERIFIED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'VERIFIED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-navy-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 size={14} /> Verified (Level 1) ({verifiedSubmissions.length})
        </button>

        <button
          onClick={() => setActiveTab('CORRECTIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'CORRECTIONS'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-navy-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle size={14} /> In Correction ({correctionSubmissions.length})
        </button>
      </div>

      {/* Submissions Review Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {displayedList.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck size={40} className="mx-auto text-emerald-500 mb-2" />
            <h3 className="text-base font-bold text-navy-800">Queue is Clear</h3>
            <p className="text-xs text-navy-400 mt-1">No items found matching the selected review status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-navy-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Sub ID</th>
                  <th className="py-3.5 px-4">Project User</th>
                  <th className="py-3.5 px-4">Parameter</th>
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Consumption</th>
                  <th className="py-3.5 px-4">Calculated CO₂e</th>
                  <th className="py-3.5 px-4">Remarks</th>
                  <th className="py-3.5 px-4">Submission & Files</th>
                  <th className="py-3.5 px-4">Full Record</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedList.map(sub => {
                  const customParameters = readStoredValue<Record<string, import('../../types').ESGParameter[]>>(MEIL_STORAGE_KEYS.parameters, {})[sub.projectId] ?? [];
                  const param = getParameterById(sub.parameterId) ?? customParameters.find(parameter => (parameter.parameterId ?? parameter.code) === sub.parameterId);
                  const officer = projectUsers.find(user => user.id === sub.userId) ?? getUserById(sub.userId);
                  const files = evidence.filter(file => sub.evidenceIds.includes(file.evidenceId) || file.submissionId === sub.id);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-800">
                        {sub.id}
                      </td>
                      <td className="py-3.5 px-4 text-navy-600">{officer?.name ?? 'Project User'}<span className="block text-[10px] text-slate-400">{officer?.email}</span></td>
                      <td className="py-3.5 px-4 font-bold text-navy-900">
                        {param ? param.name : sub.parameterId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-navy-600">
                        {sub.period}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-navy-800">
                        {sub.value.toLocaleString()} {sub.unit || param?.unit}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-navy-900">
                        {sub.calculatedCO2e ? `${sub.calculatedCO2e.toFixed(3)} t` : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-navy-600">
                        {sub.notes || '—'}
                      </td>
                      <td className="max-w-xs py-3.5 px-4">
                        <div className="space-y-1">{files.length ? files.map(file => <span key={file.evidenceId} className="flex items-center gap-1 text-[11px] font-semibold text-blue-700"><Eye size={12} />{file.originalFilename}<span className="font-normal text-slate-400">({(file.fileSize / 1024).toFixed(0)} KB)</span></span>) : <span className="text-rose-600 font-semibold text-[11px]">No evidence attached</span>}</div>
                      </td>
                      <td className="py-3.5 px-4"><button type="button" onClick={() => setSelectedSubmissionId(sub.id)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-50">View full data & files</button></td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {sub.status === SubmissionStatus.SUBMITTED || sub.status === SubmissionStatus.UNDER_REVIEW ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(sub)}
                              className="btn-primary btn-sm inline-flex items-center gap-1 text-[11px] py-1 px-3 bg-emerald-600 hover:bg-emerald-700"
                              title="Certify & Verify Level 1"
                            >
                              <Check size={12} /> Verify
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSubForCorrection(sub.raw as ParameterSubmission);
                                setCorrectionNote('Evidence invoice mismatch with entered consumption quantity.');
                              }}
                              className="btn-secondary btn-sm inline-flex items-center gap-1 text-[11px] py-1 px-2.5 text-rose-600 hover:bg-rose-50 border-rose-200"
                              title="Request Correction"
                            >
                              <X size={12} /> Reject
                            </button>
                          </div>
                        ) : sub.status === SubmissionStatus.VERIFIED_LEVEL_1 ? (
                          <span className="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1">
                            <CheckCircle2 size={12} /> Certified
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold text-[11px]">
                            Correction Sent
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Correction Modal */}
      {selectedSubForCorrection && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertTriangle size={20} />
              <span>Issue Correction Notice</span>
            </div>
            <p className="text-xs text-navy-600">
              Returning submission <span className="font-mono font-bold">{selectedSubForCorrection.id}</span> to site field officer. Specify the discrepancy details.
            </p>
            <form onSubmit={handleRequestCorrection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                  Supervisor Audit Remarks
                </label>
                <textarea
                  rows={4}
                  required
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  className="input-field w-full text-xs"
                  placeholder="State reason for rejection, required invoice recalculation, or missing meter logs..."
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubForCorrection(null)}
                  className="btn-secondary btn-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-sm text-xs bg-rose-600 hover:bg-rose-700"
                >
                  Send Correction Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSubmissionId && (() => {
        const item = normalized.find(submission => submission.id === selectedSubmissionId);
        if (!item) return null;
        const linkedFiles = evidence.filter(file => item.evidenceIds.includes(file.evidenceId) || file.submissionId === item.id);
        const raw = item.raw as ParameterSubmission | ProjectUserSubmission;
        const isProjectUserRecord = item.kind === 'user';
        const calculation = isProjectUserRecord ? (raw as ProjectUserSubmission).calculation : undefined;
        return <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4"><section className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><header className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white p-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Complete submission record</p><h2 className="mt-1 text-lg font-bold text-navy-900">{item.id}</h2><p className="mt-1 text-xs text-slate-500">{project?.name} · {projectUsers.find(person => person.id === item.userId)?.name || getUserById(item.userId)?.name || 'Project user'} · {item.period}</p></div><button onClick={() => setSelectedSubmissionId(null)} className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100">Close</button></header><div className="space-y-5 p-5"><div className="grid gap-3 sm:grid-cols-3"><Info label="Parameter" value={getParameterById(item.parameterId)?.name || item.parameterId}/><Info label="Scope" value={String(item.raw.scope || '—')}/><Info label="Status" value={String(item.status)}/><Info label="Activity data" value={`${item.value.toLocaleString()} ${item.unit}`}/><Info label="Reporting period" value={item.period || '—'}/><Info label="Calculated emissions" value={`${item.calculatedCO2e.toFixed(4)} tCO₂e`}/><Info label="Emission factor" value={isProjectUserRecord ? `${calculation?.emissionFactorValue ?? '—'} ${calculation?.emissionFactorUnit ?? ''}` : `${(raw as ParameterSubmission).emissionFactorValue ?? '—'} ${(raw as ParameterSubmission).co2eUnit ?? ''}`}/><Info label="Data entry date" value={isProjectUserRecord ? (raw as ProjectUserSubmission).dataEntryDate : (raw as ParameterSubmission).createdAt?.slice(0,10) || '—'}/><Info label="Submitted at" value={raw.submittedAt ? formatDateTime(raw.submittedAt) : '—'}/></div><div className="rounded-xl border border-slate-200 p-4"><h3 className="font-semibold text-navy-900">Remarks and review notes</h3><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.notes || 'No remarks supplied.'}</p>{raw.supervisorNotes&&<p className="mt-3 whitespace-pre-wrap rounded-lg bg-amber-50 p-3 text-xs text-amber-900"><strong>Supervisor notes:</strong> {raw.supervisorNotes}</p>}</div>{calculation&&<div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"><h3 className="font-semibold text-navy-900">Calculation details</h3><div className="mt-3 grid gap-3 text-xs sm:grid-cols-2"><Info label="Factor source" value={calculation.emissionFactorSource||'—'}/><Info label="Formula" value={calculation.formula}/><Info label="Raw kg CO₂e" value={calculation.rawKgCO2e.toLocaleString()}/><Info label="Calculated at" value={formatDateTime(calculation.calculatedAt)}/></div></div>}<div><h3 className="mb-2 font-semibold text-navy-900">Uploaded evidence ({linkedFiles.length})</h3>{linkedFiles.length?<div className="space-y-2">{linkedFiles.map(file=><EvidenceFileLink key={file.evidenceId} file={file}/>)}</div>:<p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No evidence file was attached to this submission.</p>}</div></div></section></div>;
      })()}

    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 break-words text-xs font-medium text-navy-900">{value}</p></div>;
}
