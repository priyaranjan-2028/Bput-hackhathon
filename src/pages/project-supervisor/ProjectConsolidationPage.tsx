import React, { useEffect, useState } from 'react';
import { projects as seedProjects, parameterSubmissions as sampleSubmissions, consolidationRecords as sampleRecords, formatDateTime } from '../../data/mockData';
import { SubmissionStatus, ConsolidationRecord, Scope, User } from '../../types';
import { ProjectUserSubmission } from '../../types/projectUser';
import { readStoredValue, writeStoredValue, MEIL_STORAGE_KEYS } from '../../services/localStorageService';
import { Layers, CheckCircle2, AlertTriangle, ArrowRight, Lock, Building2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getBusinessUnitProjects } from '../../services/businessUnitService';

interface ForwardedBatch extends ConsolidationRecord { status: SubmissionStatus.FORWARDED; forwardedAt: string; }

export default function ProjectConsolidationPage() {
  const { user: supervisor } = useAuth();
  const projects = getBusinessUnitProjects(supervisor?.businessUnitId || 'BU001');
  const projectId = supervisor?.assignedProjectIds?.[0] ?? projects[0]?.id;
  const project = projects.find(item => item.id === projectId) ?? projects[0] ?? seedProjects[0];
  const [records, setRecords] = useState<ConsolidationRecord[]>(() => readStoredValue<ConsolidationRecord[]>('meil_project_consolidations', sampleRecords.filter(record => record.level === 'PROJECT')));
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [activeBatch, setActiveBatch] = useState<ConsolidationRecord | null>(null);
  const [forwarded, setForwarded] = useState(false);

  const legacy = readStoredValue<typeof sampleSubmissions>('meil_supervisor_submissions', sampleSubmissions).filter(submission => submission.projectId === project.id);
  const current = readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions, []).filter(submission => submission.projectId === project.id && submission.status !== SubmissionStatus.DRAFT);
  const items = [
    ...legacy.map(submission => ({ id: submission.id ?? submission.submissionId ?? '', parameterId: submission.parameterId, activityValue: submission.activityData ?? submission.value ?? 0, status: submission.status, scope: submission.scope, calculatedCO2e: submission.calculatedCO2e ?? 0, reportingPeriod: submission.reportingPeriod ?? submission.period ?? '', userId: submission.userId ?? submission.submittedBy })),
    ...current.map(submission => ({ id: submission.submissionId, parameterId: submission.parameterId, activityValue: submission.activityValue, status: submission.status, scope: submission.scope, calculatedCO2e: submission.calculation?.convertedTonnesCO2e ?? 0, reportingPeriod: submission.reportingPeriod, userId: submission.userId })),
  ].filter((item, index, all) => all.findIndex(other => other.id === item.id) === index);
  const unverified = items.filter(item => ![SubmissionStatus.VERIFIED_LEVEL_1, SubmissionStatus.APPROVED, SubmissionStatus.CONSOLIDATED_PROJECT, SubmissionStatus.FORWARDED].includes(item.status)).length;
  const verified = items.length - unverified;
  const sectionCData = items.filter(item => item.scope === Scope.SECTION_C || item.scope === Scope.OTHER_ENVIRONMENTAL).reduce<Record<string, number>>((summary, item) => { summary[item.parameterId] = (summary[item.parameterId] || 0) + item.activityValue; return summary; }, {});
  const scopeTotal = (scope: Scope) => items.filter(item => item.scope === scope && [SubmissionStatus.VERIFIED_LEVEL_1, SubmissionStatus.APPROVED, SubmissionStatus.CONSOLIDATED_PROJECT, SubmissionStatus.FORWARDED].includes(item.status)).reduce((sum, item) => sum + item.calculatedCO2e, 0);
  const scope1 = scopeTotal(Scope.SCOPE_1);
  const scope2 = scopeTotal(Scope.SCOPE_2);
  const scope3 = scopeTotal(Scope.SCOPE_3);
  const total = scope1 + scope2 + scope3;
  const forwardedBatches = records.filter(record => record.status === SubmissionStatus.FORWARDED) as ForwardedBatch[];

  useEffect(() => {
    if (!activeBatch || progress >= 100) return;
    const timer = window.setTimeout(() => setProgress(value => Math.min(100, value + 10)), 120);
    return () => window.clearTimeout(timer);
  }, [activeBatch, progress]);

  useEffect(() => {
    if (activeBatch && progress === 100) {
      const merged: ConsolidationRecord = { ...activeBatch, status: 'SEALED', consolidatedAt: new Date().toISOString() };
      setRecords(previous => {
        const next = [merged, ...previous.filter(record => record.id !== merged.id)];
        writeStoredValue('meil_project_consolidations', next);
        return next;
      });
      const projectUserSubs = readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions, []);
      writeStoredValue(MEIL_STORAGE_KEYS.submissions, projectUserSubs.map(submission => activeBatch.childRecordIds?.includes(submission.submissionId) ? { ...submission, status: SubmissionStatus.CONSOLIDATED_PROJECT, updatedAt: new Date().toISOString() } : submission));
      const supervisorSubs = readStoredValue<typeof sampleSubmissions>('meil_supervisor_submissions', sampleSubmissions);
      writeStoredValue('meil_supervisor_submissions', supervisorSubs.map(submission => activeBatch.childRecordIds?.includes(submission.id ?? submission.submissionId ?? '') ? { ...submission, status: SubmissionStatus.CONSOLIDATED_PROJECT } : submission));
      setMessage('Project data merged and sealed. It is ready to forward to the Business Unit Supervisor.');
    }
  }, [activeBatch, progress]);

  const startMerge = () => {
    if (unverified || !items.length) return;
    setMessage(''); setProgress(0); setForwarded(false);
    const now = new Date().toISOString();
    const batch: ConsolidationRecord = { id: `CON-${project.id}-${Date.now()}`, level: 'PROJECT', entityId: project.id, entityName: project.name, parentEntityId: project.businessUnitId, period: project.reportingPeriod ?? 'Current reporting period', reportingPeriod: project.reportingPeriod ?? 'Current reporting period', scope1Total: scope1, scope2Total: scope2, scope3Total: scope3, sectionCData, totalCO2e: total, status: 'MERGING', consolidatedBy: supervisor?.id ?? 'USR-PS-001', consolidatedAt: now, submissionCount: items.length, childRecordIds: items.map(item => item.id) };
    setActiveBatch(batch);
    writeStoredValue('meil_project_consolidations', [batch, ...records.filter(record => record.id !== batch.id)]);
  };

  const forwardBatch = () => {
    if (!activeBatch || progress < 100) return;
    const now = new Date().toISOString();
    const updated: ForwardedBatch = { ...activeBatch, status: SubmissionStatus.FORWARDED, forwardedAt: now, consolidatedAt: now };
    const next = [updated, ...records.filter(record => record.id !== updated.id)];
    writeStoredValue('meil_project_consolidations', next);
    writeStoredValue('meil_bu_incoming_batches', [updated, ...readStoredValue<ForwardedBatch[]>('meil_bu_incoming_batches', []).filter(record => record.id !== updated.id)]);
    const projectUserSubs = readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions, []);
    writeStoredValue(MEIL_STORAGE_KEYS.submissions, projectUserSubs.map(submission => activeBatch.childRecordIds?.includes(submission.submissionId) ? { ...submission, status: SubmissionStatus.FORWARDED, updatedAt: now } : submission));
    const supervisorSubs = readStoredValue<typeof sampleSubmissions>('meil_supervisor_submissions', sampleSubmissions);
    writeStoredValue('meil_supervisor_submissions', supervisorSubs.map(submission => activeBatch.childRecordIds?.includes(submission.id ?? submission.submissionId ?? '') ? { ...submission, status: SubmissionStatus.FORWARDED } : submission));
    setRecords(next); setActiveBatch(updated); setForwarded(true);
    setMessage(`Batch forwarded to Business Unit Supervisor for ${project.businessUnitId}.`);
  };

  return <div className="mx-auto max-w-5xl space-y-6">
    <header><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Project close-out workflow</p><h1 className="mt-1 text-2xl font-bold text-navy-900">Project Data Consolidation</h1><p className="mt-1 text-sm text-slate-600">Verify all project submissions, merge the approved records, then forward one project batch to the Business Unit Supervisor.</p></header>
    {message && <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 size={19} className="mt-0.5 shrink-0 text-emerald-700"/><div>{message}</div></div>}
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center"><div><h2 className="font-bold text-navy-900">{project.name}</h2><p className="mt-1 text-xs text-slate-500">{project.reportingPeriod} · Business Unit {project.businessUnitId}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">{items.length} submitted records</span></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs text-emerald-700">Verified and ready</p><p className="mt-1 text-2xl font-bold text-emerald-900">{verified}</p></div><div className={`rounded-xl border p-4 ${unverified ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}><p className="text-xs text-amber-800">Needs verification or correction</p><p className="mt-1 text-2xl font-bold text-amber-950">{unverified}</p></div><div className="rounded-xl border border-blue-200 bg-blue-50 p-4"><p className="text-xs text-blue-700">Approved emissions total</p><p className="mt-1 text-2xl font-bold text-blue-950">{total.toFixed(2)} <span className="text-xs">tCO₂e</span></p></div></div>
      {activeBatch && <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/60 p-4"><div className="flex items-center justify-between text-sm"><span className="font-semibold text-blue-950">Merging project records</span><span className="font-mono font-bold text-blue-800">{progress}%</span></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-blue-100"><div className="h-full rounded-full bg-blue-600 transition-all duration-200" style={{ width: `${progress}%` }} /></div>{progress === 100 && <p className="mt-3 text-xs font-medium text-emerald-800">All verified records merged into batch {activeBatch.id}.</p>}</div>}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">{[[Scope.SCOPE_1, 'Scope 1', scope1], [Scope.SCOPE_2, 'Scope 2', scope2], [Scope.SCOPE_3, 'Scope 3', scope3]].map(([scope, label, amount]) => <div key={String(scope)} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{String(label)}</p><p className="mt-1 font-bold text-navy-900">{Number(amount).toFixed(2)} tCO₂e</p></div>)}</div>
      <div className="mt-6 flex flex-col justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center"><p className="flex items-center gap-2 text-xs text-slate-500">{unverified ? <AlertTriangle size={15} className="text-amber-600"/> : <Lock size={15}/>} {unverified ? 'Every project submission must be verified before merging.' : 'Approved records are ready for project consolidation.'}</p>{!activeBatch || progress < 100 ? <button type="button" onClick={startMerge} disabled={Boolean(unverified) || !items.length || Boolean(activeBatch)} className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"><Layers size={16}/><Sparkles size={15}/> Merge Verified Project Data</button> : forwarded ? <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800"><CheckCircle2 size={16}/> Forwarded</span> : <button type="button" onClick={forwardBatch} className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm"><Building2 size={16}/> Forward to Business Unit <ArrowRight size={16}/></button>}</div>
    </section>
    {forwardedBatches.length > 0 && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-navy-900">Forwarded Project Batches</h2><p className="mt-1 text-xs text-slate-500">Batches awaiting Level 2 review by the Business Unit Supervisor.</p></div><div className="divide-y divide-slate-100">{forwardedBatches.map(batch => <div key={batch.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm"><div><p className="font-mono font-semibold text-blue-800">{batch.id}</p><p className="mt-1 text-xs text-slate-500">{batch.entityName} · {batch.reportingPeriod} · {batch.submissionCount} records</p></div><div className="text-right"><p className="font-bold text-navy-900">{batch.totalCO2e.toFixed(2)} tCO₂e</p><p className="text-xs text-emerald-700">Forwarded {formatDateTime(batch.consolidatedAt)}</p></div></div>)}</div></section>}
  </div>;
}
