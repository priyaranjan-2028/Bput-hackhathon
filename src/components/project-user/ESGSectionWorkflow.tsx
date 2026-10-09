import React, { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Scope, SubmissionStatus } from '../../types';
import { ProjectUserEvidence } from '../../types/projectUser';
import { getAssignedParameters } from '../../services/parameterService';
import {
  createProjectUserSubmission,
  getSubmissionById,
  getUserSubmissions,
  saveSubmission,
} from '../../services/submissionService';
import {
  attachEvidenceToSubmission,
  createEvidenceMetadata,
  getUserEvidence,
} from '../../services/evidenceService';
import { addSubmissionNotification } from '../../services/notificationService';
import { projectUserSubmissionSchema, ProjectUserSubmissionInput } from '../../utils/projectUserValidation';
import { getTodayISO, formatDisplayDate, validateDataEntryDate } from '../../utils/dateUtils';
import { calculateCO2e } from '../../services/calculationService';
import { getBusinessUnitById, getProjectById, getSubsidiaryById, getUserById } from '../../data/mockData';
import ProjectUserStatusBadge from './StatusBadge';
import {
  AlertCircle,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  Info,
  Upload,
  X,
} from 'lucide-react';

const scopeLabels: Record<Scope | 'OTHER', string> = {
  [Scope.SCOPE_1]: 'Scope 1',
  [Scope.SCOPE_2]: 'Scope 2',
  [Scope.SCOPE_3]: 'Scope 3',
  [Scope.SECTION_C]: 'Other Section C',
  [Scope.OTHER_ENVIRONMENTAL]: 'Other Section C',
  OTHER: 'Other Section C',
};

interface ESGSectionWorkflowProps {
  scope: Scope | 'OTHER';
}

export default function ESGSectionWorkflow({ scope }: ESGSectionWorkflowProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedDraftId = searchParams.get('draft');
  const requestedParameterId = searchParams.get('parameter');
  const project = user?.projectId ? getProjectById(user.projectId) : undefined;
  const businessUnit = user?.businessUnitId ? getBusinessUnitById(user.businessUnitId) : undefined;
  const subsidiary = user?.subsidiaryId ? getSubsidiaryById(user.subsidiaryId) : undefined;
  const supervisor = project?.supervisorId ? getUserById(project.supervisorId) : undefined;
  const sectionScope = scope === 'OTHER' ? Scope.SECTION_C : scope;
  const parameters = useMemo(
    () => user ? getAssignedParameters(user.id).filter(parameter => {
      if (scope === 'OTHER') return parameter.scope === Scope.SECTION_C || parameter.scope === Scope.OTHER_ENVIRONMENTAL;
      return parameter.scope === sectionScope;
    }) : [],
    [scope, sectionScope, user],
  );
  const existingSubmissions = user && project ? getUserSubmissions(user.id, project.id) : [];
  const [dataEntryDate, setDataEntryDate] = useState('');
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [selectedParameterId, setSelectedParameterId] = useState('');
  const [evidence, setEvidence] = useState<ProjectUserEvidence[]>([]);
  const [formError, setFormError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [showCalculation, setShowCalculation] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);

  const form = useForm<ProjectUserSubmissionInput>({
    resolver: zodResolver(projectUserSubmissionSchema),
    defaultValues: {
      dataEntryDate: '',
      parameterId: '',
      activityUnit: '',
      activityValue: 0,
      remarks: '',
      evidenceIds: [],
      requiresEvidence: false,
      calculationRequired: false,
      calculationAvailable: true,
    },
  });
  const selectedParameter = parameters.find(parameter => parameter.parameterId === selectedParameterId);
  const factor = selectedParameter?.emissionFactor;
  const factorValue = factor?.factorValue ?? factor?.factor;
  const activityValue = form.watch('activityValue');
  const calculation = selectedParameter?.calculationRequired && factor && factorValue !== undefined && Number.isFinite(activityValue) && activityValue > 0
    ? calculateCO2e({
        activityValue,
        activityUnit: selectedParameter.unit,
        emissionFactorId: factor.factorId ?? factor.id ?? '',
        emissionFactorValue: factorValue ?? Number.NaN,
        emissionFactorUnit: factor.unit,
      })
    : undefined;

  const confirmDate = () => {
    const error = validateDataEntryDate(dataEntryDate);
    if (error) {
      setFormError(error);
      setDateConfirmed(false);
      return;
    }
    setFormError('');
    setDateConfirmed(true);
    form.setValue('dataEntryDate', dataEntryDate, { shouldValidate: true });
    const draft = requestedDraftId && user ? getSubmissionById(user.id, requestedDraftId) : undefined;
    if (draft?.status === SubmissionStatus.DRAFT && draft.scope === sectionScope) {
      const parameter = parameters.find(item => item.parameterId === draft.parameterId);
      if (parameter) {
        setSelectedParameterId(draft.parameterId);
        const draftEvidence = getUserEvidence(user.id).filter(item => draft.evidenceIds.includes(item.evidenceId));
        setEvidence(draftEvidence);
        form.reset({
          dataEntryDate,
          parameterId: draft.parameterId,
          activityValue: draft.activityValue,
          activityUnit: parameter.unit,
          remarks: draft.remarks,
          evidenceIds: draft.evidenceIds,
          requiresEvidence: Boolean(parameter.requiresEvidence),
          calculationRequired: parameter.calculationRequired,
          calculationAvailable: !parameter.calculationRequired || Boolean(parameter.emissionFactor && (parameter.emissionFactor.factorValue ?? parameter.emissionFactor.factor) !== undefined),
        });
      }
    } else if (requestedParameterId) {
      const parameter = parameters.find(item => (item.parameterId ?? item.code) === requestedParameterId);
      if (parameter) {
        setSelectedParameterId(requestedParameterId);
        setEvidence([]);
        form.reset({
          dataEntryDate,
          parameterId: requestedParameterId,
          activityValue: 0,
          activityUnit: parameter.unit,
          remarks: '',
          evidenceIds: [],
          requiresEvidence: Boolean(parameter.requiresEvidence),
          calculationRequired: parameter.calculationRequired,
          calculationAvailable: !parameter.calculationRequired || Boolean(parameter.emissionFactor && (parameter.emissionFactor.factorValue ?? parameter.emissionFactor.factor) !== undefined),
        });
      }
    }
  };

  const selectParameter = (parameterId: string) => {
    setSelectedParameterId(parameterId);
    setEvidence([]);
    setValidationIssues([]);
    setFormError('');
    const parameter = parameters.find(item => item.parameterId === parameterId);
    form.reset({
      dataEntryDate,
      parameterId,
      activityValue: 0,
      activityUnit: parameter?.unit ?? '',
      remarks: '',
      evidenceIds: [],
      requiresEvidence: parameter?.requiresEvidence ?? false,
      calculationRequired: parameter?.calculationRequired ?? false,
      calculationAvailable: !parameter?.calculationRequired || Boolean(parameter.emissionFactor && (parameter.emissionFactor.factorValue ?? parameter.emissionFactor.factor) !== undefined),
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!user || !project || !businessUnit || !subsidiary || !selectedParameter) return;
    if (!files?.length) return;
    try {
      const uploaded = await Promise.all(Array.from(files).map(file => createEvidenceMetadata({
        file,
        userId: user.id,
        projectId: project.id,
        businessUnitId: businessUnit.id,
        subsidiaryId: subsidiary.id,
        parameterId: selectedParameter.parameterId ?? selectedParameter.code,
      })));
      const nextEvidence = [...evidence, ...uploaded];
      setEvidence(nextEvidence);
      form.setValue('evidenceIds', nextEvidence.map(item => item.evidenceId), { shouldValidate: true });
      setFormError('');
      setValidationIssues([]);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Evidence could not be added.');
    }
  };

  const removeEvidence = (evidenceId: string) => {
    const nextEvidence = evidence.filter(item => item.evidenceId !== evidenceId);
    setEvidence(nextEvidence);
    form.setValue('evidenceIds', nextEvidence.map(item => item.evidenceId), { shouldValidate: true });
  };

  const validatedPayload = (allowDraft: boolean): ProjectUserSubmissionInput | undefined => {
    if (!user || !project || !businessUnit || !subsidiary || !selectedParameter) {
      setFormError('Project assignment or parameter information is unavailable. Contact your Project Supervisor.');
      return undefined;
    }
    const dateError = validateDataEntryDate(dataEntryDate);
    if (dateError) {
      setFormError(dateError);
      setDateConfirmed(false);
      return undefined;
    }
    const candidate = {
      ...form.getValues(),
      dataEntryDate,
      parameterId: selectedParameter.parameterId ?? selectedParameter.code,
      activityUnit: selectedParameter.unit,
      activityValue: Number(form.getValues('activityValue')),
      evidenceIds: evidence.map(item => item.evidenceId),
      requiresEvidence: allowDraft ? false : Boolean(selectedParameter.requiresEvidence),
      calculationRequired: allowDraft ? false : selectedParameter.calculationRequired,
      calculationAvailable: allowDraft || !selectedParameter.calculationRequired || Boolean(calculation),
    };
    const parsed = projectUserSubmissionSchema.safeParse(candidate);
    if (!parsed.success) {
      const issues = parsed.error.issues.map(issue => issue.message);
      setValidationIssues(issues);
      setFormError(allowDraft ? issues[0] : 'Complete the highlighted items before submitting.');
      return undefined;
    }
    setValidationIssues([]);
    setFormError('');
    return parsed.data;
  };

  const persist = (status: SubmissionStatus) => {
    const data = validatedPayload(status === SubmissionStatus.DRAFT);
    if (!data || !user || !project || !businessUnit || !subsidiary || !selectedParameter) return;
    const existingDraft = getUserSubmissions(user.id, project.id).find(submission =>
      submission.status === SubmissionStatus.DRAFT && submission.parameterId === data.parameterId
    );
    const submission = createProjectUserSubmission({
      userId: user.id,
      projectId: project.id,
      businessUnitId: businessUnit.id,
      subsidiaryId: subsidiary.id,
      parameterId: data.parameterId,
      scope: selectedParameter.scope,
      dataEntryDate: data.dataEntryDate,
      reportingPeriod: project.reportingPeriod ?? 'FY 2025-26',
      activityValue: data.activityValue,
      activityUnit: data.activityUnit,
      emissionFactorId: factor?.factorId ?? factor?.id,
      calculation,
      remarks: data.remarks,
      evidenceIds: data.evidenceIds,
      status,
      submissionId: existingDraft?.submissionId,
    });
    try {
      const saved = saveSubmission(submission);
      attachEvidenceToSubmission(saved.evidenceIds, saved.submissionId, user.id);
      if (status !== SubmissionStatus.DRAFT) addSubmissionNotification(saved);
      setSavedMessage(status === SubmissionStatus.DRAFT ? 'Draft saved. You can continue editing it from My Submissions.' : `Submission ${saved.submissionId} was created successfully.`);
      setShowConfirmation(false);
      if (status !== SubmissionStatus.DRAFT) {
        window.setTimeout(() => navigate(`/submissions/${encodeURIComponent(saved.submissionId)}`), 900);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The submission could not be saved.');
    }
  };

  const requestSubmit = async () => {
    const isValid = await form.trigger();
    const data = validatedPayload(false);
    if (!isValid || !data) return;
    setShowConfirmation(true);
  };

  const handleSaveDraft = () => persist(SubmissionStatus.DRAFT);

  if (!user) return null;
  const scopeLabel = scopeLabels[scope];

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-navy-950 via-navy-900 to-blue-900 px-6 py-6 text-white sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">Project User Workspace · ESG Data Collection</p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{scopeLabel} <span className="font-medium text-blue-200">/</span> {scope === 'OTHER' ? 'ESG Indicators' : 'GHG Emissions'}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Enter assigned activity data, attach source evidence and review the system calculation before submission.</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur-sm">
              <span className="block text-xs text-blue-200">Reporting period</span>
              <span className="mt-1 block font-semibold">{project?.reportingPeriod ?? 'FY 2025-26'}</span>
            </div>
          </div>
        </div>
        <div className="grid gap-3 px-6 py-4 sm:grid-cols-3 sm:px-8">
          {['Confirm entry date', 'Enter activity data', 'Review and submit'].map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index === 0 && dateConfirmed ? 'bg-emerald-100 text-emerald-800' : index === 1 && selectedParameter ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
              <span className={`text-xs font-medium ${index === 0 && dateConfirmed || index === 1 && selectedParameter ? 'text-navy-900' : 'text-slate-500'}`}>{step}</span>
              {index < 2 && <span className="ml-auto hidden h-px flex-1 bg-slate-200 sm:block" />}
            </div>
          ))}
        </div>
      </header>

      <section aria-labelledby="data-entry-date-title" className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700"><CalendarCheck2 size={20} /></div>
            <div>
              <h2 id="data-entry-date-title" className="font-semibold text-navy-900">Data Entry Date <span className="text-rose-600">*</span></h2>
              <p className="mt-1 text-sm text-navy-600">Only today’s date is accepted. This is separate from the reporting period.</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="entry-date" className="sr-only">Select today's data entry date</label>
            <input
              id="entry-date"
              type="date"
              value={dataEntryDate}
              min={getTodayISO()}
              max={getTodayISO()}
              onChange={event => {
                setDataEntryDate(event.target.value);
                setDateConfirmed(false);
                setSelectedParameterId('');
                setFormError('');
              }}
              className="input-field w-full sm:w-auto"
              aria-describedby="entry-date-help"
            />
            <button type="button" onClick={confirmDate} className="btn-primary whitespace-nowrap">
              Confirm today’s date
            </button>
          </div>
        </div>
        <p id="entry-date-help" className="mt-3 text-xs text-navy-500">
          Reporting period: <strong>{project?.reportingPeriod ?? 'FY 2025-26'}</strong>. Today's system date is {formatDisplayDate(getTodayISO())}.
        </p>
        {dateConfirmed && <p role="status" className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 size={16} /> Today’s date confirmed. You may continue.</p>}
        {!dateConfirmed && <p className="mt-2 text-sm font-medium text-amber-800">Select today’s Data Entry Date to continue.</p>}
      </section>

      {formError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle className="mr-2 inline" size={16} />{formError}</div>}
      {savedMessage && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{savedMessage}</div>}

      {!dateConfirmed ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">Parameter and data entry remain locked until today’s date is confirmed.</div>
      ) : parameters.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Info className="mx-auto text-slate-400" size={24} />
          <h2 className="mt-3 font-semibold text-navy-900">No {scopeLabel} parameters assigned</h2>
          <p className="mt-1 text-sm text-navy-600">Your Project Supervisor has not assigned parameters in this section. Contact your supervisor if this is unexpected.</p>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-4">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Step 2 · Choose an indicator</p><h2 className="mt-1 text-lg font-bold text-navy-900">Assigned Parameters</h2></div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-navy-600">{parameters.length} available · definitions are read-only</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {parameters.map(parameter => (
                (() => {
                  const parameterId = parameter.parameterId ?? parameter.code;
                  const latestSubmission = existingSubmissions
                    .filter(submission => submission.parameterId === parameterId)
                    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
                  return <button
                    type="button"
                    key={parameter.parameterId}
                    onClick={() => selectParameter(parameterId)}
                    aria-pressed={selectedParameterId === parameterId}
                    className={`group rounded-xl border p-4 text-left shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${selectedParameterId === parameterId ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md'}`}
                  >
                    <span className="block font-semibold text-navy-900">{parameter.name}</span>
                    <span className="mt-1 block text-xs text-navy-600">{parameter.unit} · {parameter.category}</span>
                    <span className="mt-3 flex items-center justify-between gap-2">
                      {latestSubmission ? <ProjectUserStatusBadge status={latestSubmission.status} /> : <span className="text-xs text-slate-500">Not started · evidence {parameter.requiresEvidence ? 'required' : 'optional'}</span>}
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">Select <ChevronRight size={14} /></span>
                    </span>
                  </button>;
                })()
              ))}
            </div>
          </section>

          {selectedParameter && (
            <form onSubmit={event => { event.preventDefault(); void requestSubmit(); }} className="space-y-5">
              <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
                <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div>
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{scopeLabel} · Parameter definition</p>
                        <h2 className="mt-1 text-lg font-bold text-navy-900">{selectedParameter.name}</h2>
                      </div>
                      <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">{selectedParameter.code}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-navy-700">{selectedParameter.description}</p>
                    <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                      <div><dt className="text-xs text-slate-500">Category</dt><dd className="text-sm font-medium text-navy-800">{selectedParameter.category}</dd></div>
                      <div><dt className="text-xs text-slate-500">Unit</dt><dd className="text-sm font-medium text-navy-800">{selectedParameter.unit}</dd></div>
                      <div><dt className="text-xs text-slate-500">Evidence</dt><dd className="text-sm font-medium text-navy-800">{selectedParameter.requiresEvidence ? 'Required' : 'Not required'}</dd></div>
                      <div><dt className="text-xs text-slate-500">Calculation</dt><dd className="text-sm font-medium text-navy-800">{selectedParameter.calculationRequired ? 'Automatic CO₂e' : 'Indicator only'}</dd></div>
                    </dl>
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Step 3 · Activity information</p><h3 className="mt-1 text-base font-bold text-navy-900">Activity Data</h3></div>
                      <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{formatDisplayDate(dataEntryDate)}</span>
                    </div>
                    <label htmlFor="activity-value" className="mb-1 block text-sm font-medium text-navy-800">Activity / indicator value ({selectedParameter.unit})</label>
                    <input
                      id="activity-value"
                      type="number"
                      min="0"
                      step="any"
                      {...form.register('activityValue', { valueAsNumber: true })}
                      onChange={event => {
                        form.setValue('activityValue', event.target.value === '' ? Number.NaN : Number(event.target.value), { shouldValidate: true });
                        setFormError('');
                        setValidationIssues([]);
                      }}
                      className="input-field w-full py-3 text-base font-medium"
                      aria-invalid={Boolean(form.formState.errors.activityValue)}
                      aria-describedby="activity-value-error"
                    />
                    {form.formState.errors.activityValue && <p id="activity-value-error" className="mt-1 text-xs text-rose-700">{form.formState.errors.activityValue.message}</p>}
                    <input type="hidden" {...form.register('activityUnit')} value={selectedParameter.unit} />
                    <input type="hidden" {...form.register('parameterId')} value={selectedParameter.parameterId ?? selectedParameter.code} />
                    <div className="mt-4">
                      <label htmlFor="remarks" className="mb-1 block text-sm font-medium text-navy-800">Remarks <span className="font-normal text-slate-500">(optional)</span></label>
                      <textarea id="remarks" rows={4} maxLength={500} {...form.register('remarks')} onChange={event => { form.setValue('remarks', event.target.value, { shouldValidate: true }); setFormError(''); setValidationIssues([]); }} className="input-field w-full resize-y" placeholder="Add relevant source, meter serial or reporting context." />
                      <p className="mt-1 text-right text-xs text-slate-500">{form.watch('remarks')?.length ?? 0}/500</p>
                    </div>
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-navy-900">Configured Emission Factor</h3>
                    {selectedParameter.calculationRequired && factor ? (
                      <>
                        <p className="mt-3 text-2xl font-bold text-navy-900">{factorValue} <span className="text-sm font-medium">{factor.unit}</span></p>
                        <dl className="mt-3 space-y-2 text-sm">
                          <div className="flex justify-between gap-3"><dt className="text-slate-500">Factor ID</dt><dd className="font-mono text-xs">{factor.factorId ?? factor.id}</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-slate-500">Source</dt><dd className="text-right">{factor.source ?? 'Demo factor database'}</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-slate-500">Reporting year</dt><dd>{factor.reportingYear ?? project?.reportingPeriod ?? 'Demo'}</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-slate-500">Methodology</dt><dd className="text-right">{factor.methodology ?? 'Configured demo factor'}</dd></div>
                        </dl>
                      </>
                    ) : selectedParameter.calculationRequired ? (
                      <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">CO₂e cannot be calculated because the required emission factor is unavailable.</p>
                    ) : <p className="mt-3 text-sm text-slate-600">This indicator does not require a CO₂e calculation.</p>}
                    {calculation && (
                      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Automatic CO₂e calculation</p>
                        <p className="mt-2 text-2xl font-bold text-emerald-900">{calculation.convertedTonnesCO2e.toLocaleString(undefined, { maximumFractionDigits: 3 })} tCO₂e</p>
                        <p className="mt-1 text-xs text-emerald-800">{calculation.activityValue.toLocaleString()} {calculation.activityUnit} × {calculation.emissionFactorValue} kgCO₂e/{calculation.activityUnit} ÷ 1,000</p>
                        <button type="button" onClick={() => setShowCalculation(true)} className="mt-3 text-sm font-semibold text-emerald-800 underline">View calculation details</button>
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2"><Upload size={18} className="text-blue-700" /><h3 className="font-semibold text-navy-900">Supporting Evidence</h3></div>
                    <p className="mt-1 text-xs text-slate-600">PDF, JPG, JPEG, PNG, XLSX or DOCX · maximum 25 MB each.</p>
                    <label htmlFor="evidence-files" className="mt-4 flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-slate-300 p-5 text-center hover:border-blue-400 focus-within:ring-2 focus-within:ring-blue-600">
                      <Upload size={20} className="text-slate-500" />
                      <span className="mt-2 text-sm font-medium text-blue-700">Choose supporting files</span>
                      <input id="evidence-files" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.xlsx,.docx" onChange={event => { handleFiles(event.target.files); event.target.value = ''; }} className="sr-only" />
                    </label>
                    {form.formState.errors.evidenceIds && <p className="mt-2 text-xs text-rose-700">{form.formState.errors.evidenceIds.message}</p>}
                    <ul className="mt-3 space-y-2">
                      {evidence.map(item => (
                        <li key={item.evidenceId} className="rounded-lg bg-slate-50 p-3 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0"><p className="break-all font-medium text-navy-900">{item.originalFilename}</p><p className="mt-1 break-all font-mono text-slate-600">{item.systemFilename}</p><p className="mt-1 text-slate-500">{item.evidenceId} · {(item.fileSize / 1024).toFixed(1)} KB</p></div>
                            <button type="button" onClick={() => removeEvidence(item.evidenceId)} aria-label={`Remove ${item.originalFilename}`} className="rounded p-1 text-slate-500 hover:bg-white hover:text-rose-700"><X size={15} /></button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Step 4 · Final check</p><h3 className="mt-1 flex items-center gap-2 text-lg font-bold text-navy-900"><ClipboardCheck size={19} className="text-blue-700" /> Review your entry</h3></div><span className="text-xs text-slate-500">Check the details before submitting</span></div>
                <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div><dt className="text-xs text-slate-500">Parameter</dt><dd className="font-medium text-navy-900">{selectedParameter.name}</dd></div>
                  <div><dt className="text-xs text-slate-500">Data Entry Date</dt><dd className="font-medium text-navy-900">{formatDisplayDate(dataEntryDate)}</dd></div>
                  <div><dt className="text-xs text-slate-500">Reporting Period</dt><dd className="font-medium text-navy-900">{project?.reportingPeriod ?? 'FY 2025-26'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Activity Data</dt><dd className="font-medium text-navy-900">{Number.isFinite(activityValue) && activityValue > 0 ? `${activityValue.toLocaleString()} ${selectedParameter.unit}` : 'Not entered'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Supporting Evidence</dt><dd className="font-medium text-navy-900">{evidence.length} file(s)</dd></div>
                  <div><dt className="text-xs text-slate-500">Calculated CO₂e</dt><dd className="font-medium text-navy-900">{calculation ? `${calculation.convertedTonnesCO2e.toFixed(3)} tCO₂e` : selectedParameter.calculationRequired ? activityValue > 0 ? 'Not available' : 'Not calculated' : 'Not applicable'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Next reviewer</dt><dd className="font-medium text-navy-900">{supervisor?.name ?? 'Project Supervisor'}</dd></div>
                </dl>
                {validationIssues.length > 0 && <ul className="mt-4 list-inside list-disc rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{validationIssues.map((issue, index) => <li key={`${issue}-${index}`}>{issue}</li>)}</ul>}
                <div className="sticky bottom-0 -mx-5 mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white/95 px-5 pb-1 pt-4 backdrop-blur sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
                  <button type="button" onClick={handleSaveDraft} className="btn-secondary">Save Draft</button>
                  <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2"><FileCheck2 size={16} /> Submit for Verification</button>
                </div>
              </section>
            </form>
          )}
        </>
      )}

      {showCalculation && calculation && factor && selectedParameter && (
        <div role="dialog" aria-modal="true" aria-labelledby="calculation-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowCalculation(false)}>
          <section className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={event => event.stopPropagation()}>
            <div className="flex items-start justify-between"><div><h2 id="calculation-title" className="text-lg font-bold text-navy-900">Calculation details</h2><p className="text-sm text-slate-600">Auditable, system-generated result</p></div><button type="button" onClick={() => setShowCalculation(false)} aria-label="Close calculation details"><X size={20} /></button></div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Activity Data</dt><dd>{calculation.activityValue.toLocaleString()} {calculation.activityUnit}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Emission Factor</dt><dd>{calculation.emissionFactorValue} {calculation.emissionFactorUnit}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Emission Factor ID</dt><dd className="font-mono text-xs">{calculation.emissionFactorId}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Source</dt><dd>{factor.source ?? 'Demo factor database'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Reporting Year</dt><dd>{factor.reportingYear ?? 'Demo'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Methodology</dt><dd>{factor.methodology ?? 'Configured demo factor'}</dd></div>
              <div className="border-t border-slate-100 pt-3"><dt className="text-slate-500">Raw Calculation</dt><dd className="font-medium">{calculation.rawKgCO2e.toLocaleString()} kgCO₂e</dd></div>
              <div><dt className="text-slate-500">Converted Result</dt><dd className="text-lg font-bold text-emerald-800">{calculation.convertedTonnesCO2e.toLocaleString(undefined, { maximumFractionDigits: 3 })} tCO₂e</dd></div>
              <div><dt className="text-slate-500">Formula</dt><dd>{calculation.formula}</dd></div>
            </dl>
          </section>
        </div>
      )}

      {showConfirmation && selectedParameter && (
        <div role="dialog" aria-modal="true" aria-labelledby="submit-confirm-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowConfirmation(false)}>
          <section className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={event => event.stopPropagation()}>
            <h2 id="submit-confirm-title" className="text-lg font-bold text-navy-900">Submit ESG data for verification?</h2>
            <p className="mt-1 text-sm text-slate-600">The Project Supervisor will be notified. System-controlled values cannot be changed after submission.</p>
            <dl className="mt-5 space-y-3 rounded-lg bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-3"><dt>Data Entry Date</dt><dd className="font-medium">{formatDisplayDate(dataEntryDate)}</dd></div>
              <div className="flex justify-between gap-3"><dt>Parameter</dt><dd className="font-medium">{selectedParameter.name}</dd></div>
              <div className="flex justify-between gap-3"><dt>Activity Data</dt><dd className="font-medium">{activityValue.toLocaleString()} {selectedParameter.unit}</dd></div>
              <div className="flex justify-between gap-3"><dt>Calculated CO₂e</dt><dd className="font-medium">{calculation ? `${calculation.convertedTonnesCO2e.toFixed(3)} tCO₂e` : 'Not applicable'}</dd></div>
              <div className="flex justify-between gap-3"><dt>Evidence</dt><dd className="max-w-[60%] text-right font-medium">{evidence.length ? evidence.map(item => item.originalFilename).join(', ') : 'Not required'}</dd></div>
              <div className="flex justify-between gap-3"><dt>Status</dt><dd className="font-medium text-blue-700">Ready for Submission</dd></div>
            </dl>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setShowConfirmation(false)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={() => persist(SubmissionStatus.SUBMITTED)} className="btn-primary">Confirm Submission</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
