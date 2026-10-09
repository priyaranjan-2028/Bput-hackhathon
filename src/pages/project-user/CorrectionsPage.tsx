import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProjectById, getBusinessUnitById, getSubsidiaryById, getParameterById } from '../../data/mockData';
import { SubmissionStatus } from '../../types';
import { ProjectUserEvidence, ProjectUserSubmission } from '../../types/projectUser';
import { getUserSubmissions, saveSubmission } from '../../services/submissionService';
import { attachEvidenceToSubmission, createEvidenceMetadata, getUserEvidence } from '../../services/evidenceService';
import { addSubmissionNotification } from '../../services/notificationService';
import { getTodayISO, formatDisplayDate, validateDataEntryDate } from '../../utils/dateUtils';
import { calculateCO2e } from '../../utils/calculationUtils';
import { getAssignedParameter } from '../../services/parameterService';
import ProjectUserStatusBadge from '../../components/project-user/StatusBadge';
import { AlertTriangle, CheckCircle2, FileEdit, UploadCloud } from 'lucide-react';

export default function CorrectionsPage() {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dataEntryDate, setDataEntryDate] = useState('');
  const [activityValue, setActivityValue] = useState('');
  const [remarks, setRemarks] = useState('');
  const [newEvidence, setNewEvidence] = useState<ProjectUserEvidence[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  void refreshKey;
  if (!user) return null;

  const project = user.projectId ? getProjectById(user.projectId) : undefined;
  const businessUnit = user.businessUnitId ? getBusinessUnitById(user.businessUnitId) : undefined;
  const subsidiary = user.subsidiaryId ? getSubsidiaryById(user.subsidiaryId) : undefined;
  const allSubmissions = project ? getUserSubmissions(user.id, project.id) : [];
  const corrections = allSubmissions.filter(item =>
    item.status === SubmissionStatus.CORRECTION_REQUIRED || item.status === SubmissionStatus.CORRECTION_REQUESTED
  );
  const evidenceRecords = getUserEvidence(user.id);

  const beginCorrection = (submission: ProjectUserSubmission) => {
    setEditingId(submission.submissionId);
    setDataEntryDate('');
    setActivityValue(String(submission.activityValue));
    setRemarks('');
    setNewEvidence([]);
    setError('');
    setSuccess('');
  };

  const handleEvidence = async (files: FileList | null, submission: ProjectUserSubmission) => {
    if (!files?.length || !project || !businessUnit || !subsidiary) return;
    try {
      const parameterId = submission.parameterId;
      const uploaded = await Promise.all(Array.from(files).map(file => createEvidenceMetadata({
        file,
        userId: user.id,
        projectId: project.id,
        businessUnitId: businessUnit.id,
        subsidiaryId: subsidiary.id,
        parameterId,
        submissionId: submission.submissionId,
      })));
      setNewEvidence(current => [...current, ...uploaded]);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Evidence could not be uploaded.');
    }
  };

  const resubmit = (event: React.FormEvent, original: ProjectUserSubmission) => {
    event.preventDefault();
    const dateError = validateDataEntryDate(dataEntryDate);
    if (dateError) {
      setError(dateError);
      return;
    }
    const correctedValue = Number(activityValue);
    if (!Number.isFinite(correctedValue) || correctedValue <= 0) {
      setError('Enter an activity value greater than zero.');
      return;
    }
    const parameter = getAssignedParameter(user.id, original.parameterId);
    const retainedEvidenceIds = [...original.evidenceIds, ...newEvidence.map(file => file.evidenceId)];
    if (parameter?.requiresEvidence && retainedEvidenceIds.length === 0) {
      setError('At least one supporting evidence file is required.');
      return;
    }
    const factor = parameter?.emissionFactor;
    const factorValue = factor?.factorValue ?? factor?.factor;
    if (parameter?.calculationRequired && (!factor || factorValue === undefined)) {
      setError('CO₂e cannot be recalculated because the configured emission factor is unavailable.');
      return;
    }
    if (remarks.trim().length < 5) {
      setError('Add a short response to your Project Supervisor before resubmitting.');
      return;
    }

    try {
      const calculation = parameter?.calculationRequired && factor
        ? calculateCO2e({
            activityValue: correctedValue,
            activityUnit: original.activityUnit,
            emissionFactorId: factor.factorId ?? factor.id ?? '',
            emissionFactorValue: factorValue ?? 0,
            emissionFactorUnit: factor.unit,
          })
        : original.calculation;
      const now = new Date().toISOString();
      const updated: ProjectUserSubmission = {
        ...original,
        dataEntryDate,
        activityValue: correctedValue,
        calculation,
        remarks: remarks.trim(),
        evidenceIds: retainedEvidenceIds,
        status: SubmissionStatus.UNDER_REVIEW,
        submittedAt: now,
        updatedAt: now,
        supervisorNotes: undefined,
        correctionHistory: [...original.correctionHistory, {
          correctionId: `COR-${crypto.randomUUID()}`,
          activityValue: correctedValue,
          remarks: remarks.trim(),
          evidenceIds: newEvidence.map(file => file.evidenceId),
          correctedAt: now,
        }],
        verificationHistory: [...original.verificationHistory, {
          verificationId: `VER-${crypto.randomUUID()}`,
          verifiedBy: user.id,
          role: 'Project Data User',
          action: 'Resubmitted',
          status: SubmissionStatus.UNDER_REVIEW,
          comment: remarks.trim(),
          timestamp: now,
        }],
      };
      const saved = saveSubmission(updated);
      attachEvidenceToSubmission(newEvidence.map(file => file.evidenceId), saved.submissionId, user.id);
      addSubmissionNotification(saved, true);
      setSuccess(`${saved.submissionId} was corrected and resubmitted for verification.`);
      setEditingId(null);
      setNewEvidence([]);
      setError('');
      setRefreshKey(value => value + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The correction could not be saved.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header><p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Project User workspace</p><h1 className="mt-1 text-2xl font-bold text-navy-900">Corrections Required</h1><p className="mt-1 text-sm text-slate-600">Address supervisor comments, retain the original evidence trail, and resubmit using today’s data-entry date.</p></header>
      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><p>Approved submissions cannot be edited. A correction creates a new history entry; prior activity and evidence metadata are retained.</p></div>
      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      {success && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 className="mr-2 inline" size={16} />{success}</p>}
      {!corrections.length ? <div className="rounded-xl border border-slate-200 bg-white p-10 text-center"><CheckCircle2 size={32} className="mx-auto text-emerald-700" /><h2 className="mt-3 font-semibold text-navy-900">No pending corrections</h2><p className="mt-1 text-sm text-slate-600">Submissions returned by your Project Supervisor will appear here.</p></div> : (
        <div className="space-y-4">
          {corrections.map(submission => {
            const parameter = getParameterById(submission.parameterId);
            const editing = editingId === submission.submissionId;
            const oldEvidence = evidenceRecords.filter(file => submission.evidenceIds.includes(file.evidenceId));
            return (
              <article key={submission.submissionId} className="overflow-hidden rounded-xl border border-amber-200 bg-white">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-amber-50/60 px-5 py-4">
                  <div><h2 className="font-semibold text-navy-900">{parameter?.name ?? submission.parameterId}</h2><p className="mt-1 font-mono text-xs text-slate-600">{submission.submissionId} · {submission.scope.replaceAll('_', ' ')}</p></div><ProjectUserStatusBadge status={submission.status} />
                </header>
                <div className="space-y-4 p-5">
                  <section className="rounded-lg border border-amber-200 bg-amber-50 p-4"><h3 className="text-xs font-semibold uppercase tracking-wide text-amber-900">Supervisor comment</h3><p className="mt-1 text-sm text-amber-950">{submission.supervisorNotes ?? 'Please reconcile the reported activity value with its supporting evidence.'}</p></section>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <section className="rounded-lg bg-slate-50 p-4"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Original data · read only</h3><p className="mt-2 font-semibold text-navy-900">{submission.activityValue.toLocaleString()} {submission.activityUnit}</p><p className="mt-1 text-xs text-slate-600">Data Entry Date: {formatDisplayDate(submission.dataEntryDate)}</p><p className="mt-1 text-xs text-slate-600">Evidence: {oldEvidence.length ? oldEvidence.map(file => `${file.evidenceId} (${file.originalFilename})`).join(', ') : 'None'}</p></section>
                    <section className="rounded-lg bg-blue-50 p-4"><h3 className="text-xs font-semibold uppercase tracking-wide text-blue-800">Current status</h3><p className="mt-2 text-sm text-navy-800">Correct activity data or add replacement evidence, then send back to {getProjectById(submission.projectId)?.supervisorId ? 'your Project Supervisor' : 'review'}.</p></section>
                  </div>
                  {!editing ? <button type="button" onClick={() => beginCorrection(submission)} className="btn-primary inline-flex items-center gap-2"><FileEdit size={16} /> Correct &amp; Resubmit</button> : (
                    <form onSubmit={event => resubmit(event, submission)} className="space-y-4 border-t border-slate-100 pt-4">
                      <h3 className="font-semibold text-navy-900">Corrected data</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><label htmlFor={`correction-date-${submission.submissionId}`} className="mb-1 block text-sm font-medium text-navy-800">Data Entry Date · today only</label><input id={`correction-date-${submission.submissionId}`} type="date" min={getTodayISO()} max={getTodayISO()} value={dataEntryDate} onChange={event => setDataEntryDate(event.target.value)} className="input-field w-full" /></div>
                        <div><label htmlFor={`corrected-value-${submission.submissionId}`} className="mb-1 block text-sm font-medium text-navy-800">Activity data ({submission.activityUnit})</label><input id={`corrected-value-${submission.submissionId}`} type="number" min="0" step="any" value={activityValue} onChange={event => setActivityValue(event.target.value)} className="input-field w-full" /></div>
                      </div>
                      <div><label htmlFor={`response-${submission.submissionId}`} className="mb-1 block text-sm font-medium text-navy-800">Response to supervisor</label><textarea id={`response-${submission.submissionId}`} rows={3} maxLength={500} value={remarks} onChange={event => setRemarks(event.target.value)} className="input-field w-full" placeholder="Describe the correction made." /></div>
                      <div><label htmlFor={`correction-evidence-${submission.submissionId}`} className="mb-1 flex items-center gap-2 text-sm font-medium text-navy-800"><UploadCloud size={16} /> Add corrected evidence (optional)</label><input id={`correction-evidence-${submission.submissionId}`} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.xlsx,.docx" onChange={event => { handleEvidence(event.target.files, submission); event.target.value = ''; }} className="block w-full rounded-lg border border-slate-300 p-2 text-sm" />{newEvidence.length > 0 && <ul className="mt-2 list-inside list-disc text-xs text-slate-700">{newEvidence.map(file => <li key={file.evidenceId}>{file.evidenceId} · {file.originalFilename}</li>)}</ul>}</div>
                      <p className="text-xs text-slate-500">A new calculation will be generated using the configured, read-only emission factor. Previous evidence is preserved in the submission history.</p>
                      <div className="flex justify-end gap-3"><button type="button" onClick={() => { setEditingId(null); setError(''); }} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Resubmit for Review</button></div>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
