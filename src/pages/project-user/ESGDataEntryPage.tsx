import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Scope, SubmissionStatus } from '../../types';
import { ProjectUserEvidence, ProjectUserSubmission, ProjectUserCalculation } from '../../types/projectUser';
import { getAssignedParameters } from '../../services/parameterService';
import {
  getUserSubmissions, saveSubmission, createProjectUserSubmission,
  getSubmissionById, createSubmissionId
} from '../../services/submissionService';
import { createEvidenceMetadata, getUserEvidence, attachEvidenceToSubmission } from '../../services/evidenceService';
import { calculateCO2e } from '../../services/calculationService';
import { addSubmissionNotification } from '../../services/notificationService';
import { getTodayISO, formatDisplayDate, validateDataEntryDate } from '../../utils/dateUtils';
import { getProjectById, getBusinessUnitById, getSubsidiaryById } from '../../data/mockData';
import ProjectUserStatusBadge from '../../components/project-user/StatusBadge';
import {
  CalendarCheck2, CheckCircle2, AlertTriangle, ArrowRight,
  UploadCloud, FileText, ChevronRight, X, Info, FileCheck,
  ShieldCheck, AlertCircle, Eye, RefreshCw, FileSpreadsheet,
  FileCode, Layers, HelpCircle
} from 'lucide-react';

interface ESGDataEntryProps {
  initialScope?: Scope | 'OTHER';
}

export default function ESGDataEntryPage({ initialScope = Scope.SCOPE_1 }: ESGDataEntryProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Active section state deduced from path or props
  const activeScope: Scope = useMemo(() => {
    const path = location.pathname;
    if (path.includes('scope-2')) return Scope.SCOPE_2;
    if (path.includes('scope-3')) return Scope.SCOPE_3;
    if (path.includes('additional') || path.includes('other')) return Scope.SECTION_C;
    if (path.includes('scope-1')) return Scope.SCOPE_1;
    return initialScope === 'OTHER' ? Scope.SECTION_C : initialScope;
  }, [location.pathname, initialScope]);

  // Project context
  const project = user?.projectId ? getProjectById(user.projectId) : undefined;
  const businessUnit = user?.businessUnitId ? getBusinessUnitById(user.businessUnitId) : undefined;
  const subsidiary = user?.subsidiaryId ? getSubsidiaryById(user.subsidiaryId) : undefined;

  // Data Entry Date requirement: Strictly today's date
  const todayISO = getTodayISO();
  const [dataEntryDate, setDataEntryDate] = useState<string>(todayISO);
  const [dateConfirmed, setDateConfirmed] = useState<boolean>(true);
  const [dateError, setDateError] = useState<string>('');

  // Assigned parameters for this user
  const allAssignedParameters = useMemo(() => {
    return user ? getAssignedParameters(user.id) : [];
  }, [user]);

  // Current submissions for this user in this project
  const [submissions, setSubmissions] = useState<ProjectUserSubmission[]>([]);
  const [userEvidenceList, setUserEvidenceList] = useState<ProjectUserEvidence[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (user && project) {
      setSubmissions(getUserSubmissions(user.id, project.id));
      setUserEvidenceList(getUserEvidence(user.id));
    }
  }, [user, project, refreshTrigger]);

  // Parameters for the currently active scope
  const activeParameters = useMemo(() => {
    return allAssignedParameters.filter(p => {
      if (activeScope === Scope.SECTION_C) {
        return p.scope === Scope.SECTION_C || p.scope === Scope.OTHER_ENVIRONMENTAL;
      }
      return p.scope === activeScope;
    });
  }, [allAssignedParameters, activeScope]);

  // Tab completion progress calculations
  const tabProgress = useMemo(() => {
    const calc = (scope: Scope) => {
      const scopeParams = allAssignedParameters.filter(p =>
        scope === Scope.SECTION_C
          ? (p.scope === Scope.SECTION_C || p.scope === Scope.OTHER_ENVIRONMENTAL)
          : p.scope === scope
      );
      const completed = scopeParams.filter(p => {
        const sub = submissions.find(s => s.parameterId === (p.parameterId ?? p.code));
        return sub && [
          SubmissionStatus.APPROVED,
          SubmissionStatus.VERIFIED_LEVEL_1,
          SubmissionStatus.SUBMITTED,
          SubmissionStatus.UNDER_REVIEW,
          SubmissionStatus.RESUBMITTED
        ].includes(sub.status);
      }).length;
      return { completed, total: scopeParams.length };
    };

    return {
      scope1: calc(Scope.SCOPE_1),
      scope2: calc(Scope.SCOPE_2),
      scope3: calc(Scope.SCOPE_3),
      additional: calc(Scope.SECTION_C),
    };
  }, [allAssignedParameters, submissions]);

  // Drawer / Modal State for Parameter Data Entry
  const [activeDrawerParamId, setActiveDrawerParamId] = useState<string | null>(null);
  const [drawerMode, setDrawerMode] = useState<'edit' | 'view'>('edit');
  const [activityInput, setActivityInput] = useState<string>('');
  const [remarksInput, setRemarksInput] = useState<string>('');
  const [uploadedEvidence, setUploadedEvidence] = useState<ProjectUserEvidence[]>([]);
  const [formValidationErrors, setFormValidationErrors] = useState<string[]>([]);
  const [savingStatus, setSavingStatus] = useState<boolean>(false);

  // Success dialog state
  const [submissionSuccessData, setSubmissionSuccessData] = useState<{
    submissionId: string;
    parameterName: string;
    activityValue: number;
    unit: string;
    co2eFormatted: string;
    evidenceCount: number;
  } | null>(null);

  // Selected parameter for the drawer
  const selectedParam = useMemo(() => {
    return allAssignedParameters.find(p => (p.parameterId ?? p.code) === activeDrawerParamId);
  }, [allAssignedParameters, activeDrawerParamId]);

  // Submission for active drawer parameter if existing
  const currentParamSubmission = useMemo(() => {
    if (!activeDrawerParamId) return undefined;
    return submissions
      .filter(s => s.parameterId === activeDrawerParamId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  }, [submissions, activeDrawerParamId]);

  // Auto-calculation logic (READ-ONLY)
  const calculationResult: ProjectUserCalculation | undefined = useMemo(() => {
    if (!selectedParam) return undefined;
    if (!selectedParam.calculationRequired) return undefined;

    const numValue = Number(activityInput);
    if (!Number.isFinite(numValue) || numValue <= 0) return undefined;

    const ef = selectedParam.emissionFactor;
    const efVal = ef?.factorValue ?? ef?.factor;
    if (!ef || efVal === undefined || !Number.isFinite(efVal)) return undefined;

    try {
      return calculateCO2e({
        activityValue: numValue,
        activityUnit: selectedParam.unit,
        emissionFactorId: ef.factorId ?? ef.id ?? 'EF-DEFAULT',
        emissionFactorValue: efVal,
        emissionFactorUnit: ef.unit,
      });
    } catch {
      return undefined;
    }
  }, [selectedParam, activityInput]);

  // Check URL query parameters for direct edit/draft requests
  useEffect(() => {
    const draftId = searchParams.get('draft');
    const paramId = searchParams.get('parameter');
    if (draftId && user) {
      const draft = getSubmissionById(user.id, draftId);
      if (draft) {
        openEditDrawer(draft.parameterId, 'edit');
      }
    } else if (paramId) {
      openEditDrawer(paramId, 'edit');
    }
  }, [searchParams]);

  // Validate date whenever it changes
  const handleDateChange = (val: string) => {
    setDataEntryDate(val);
    const err = validateDataEntryDate(val);
    if (err) {
      setDateError(err);
      setDateConfirmed(false);
    } else {
      setDateError('');
      setDateConfirmed(true);
    }
  };

  // Open the Data Entry Drawer
  const openEditDrawer = (parameterId: string, mode: 'edit' | 'view' = 'edit') => {
    const p = allAssignedParameters.find(item => (item.parameterId ?? item.code) === parameterId);
    if (!p) return;

    setActiveDrawerParamId(parameterId);
    setDrawerMode(mode);
    setFormValidationErrors([]);

    const existing = submissions
      .filter(s => s.parameterId === parameterId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

    if (existing) {
      setActivityInput(String(existing.activityValue || ''));
      setRemarksInput(existing.remarks || '');
      const matchedEv = userEvidenceList.filter(e => existing.evidenceIds.includes(e.evidenceId));
      setUploadedEvidence(matchedEv);
    } else {
      setActivityInput('');
      setRemarksInput('');
      setUploadedEvidence([]);
    }
  };

  const closeDrawer = () => {
    setActiveDrawerParamId(null);
    setFormValidationErrors([]);
  };

  // Handle file uploads with automatic naming
  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length || !user || !project || !businessUnit || !subsidiary || !selectedParam) return;
    try {
      const newFiles = await Promise.all(Array.from(files).map(file => {
        return createEvidenceMetadata({
          file,
          userId: user.id,
          projectId: project.id,
          businessUnitId: businessUnit.id,
          subsidiaryId: subsidiary.id,
          parameterId: selectedParam.parameterId ?? selectedParam.code,
        });
      }));
      setUploadedEvidence(prev => [...prev, ...newFiles]);
      setFormValidationErrors([]);
    } catch (err) {
      setFormValidationErrors([err instanceof Error ? err.message : 'Error uploading file.']);
    }
  };

  const handleRemoveEvidence = (evidenceId: string) => {
    setUploadedEvidence(prev => prev.filter(e => e.evidenceId !== evidenceId));
  };

  // Save as Draft or Submit
  const handleSave = (isDraft: boolean) => {
    if (!user || !project || !businessUnit || !subsidiary || !selectedParam) return;

    // Validate date
    const dError = validateDataEntryDate(dataEntryDate);
    if (dError) {
      setDateError(dError);
      setFormValidationErrors([dError]);
      return;
    }

    const errors: string[] = [];
    const val = Number(activityInput);

    if (!isDraft) {
      if (!activityInput || !Number.isFinite(val) || val <= 0) {
        errors.push('Enter a valid positive number for activity data.');
      }

      if (selectedParam.requiresEvidence && uploadedEvidence.length === 0) {
        errors.push('At least one supporting evidence document is required for this parameter.');
      }

      if (selectedParam.calculationRequired && !calculationResult) {
        errors.push('Automatic CO₂e calculation failed. Verify activity data input.');
      }
    }

    if (errors.length > 0) {
      setFormValidationErrors(errors);
      return;
    }

    setSavingStatus(true);

    try {
      const submissionId = currentParamSubmission?.status === SubmissionStatus.DRAFT
        ? currentParamSubmission.submissionId
        : createSubmissionId();

      const newSubmission = createProjectUserSubmission({
        userId: user.id,
        projectId: project.id,
        businessUnitId: businessUnit.id,
        subsidiaryId: subsidiary.id,
        parameterId: selectedParam.parameterId ?? selectedParam.code,
        scope: selectedParam.scope,
        dataEntryDate,
        reportingPeriod: project.reportingPeriod ?? 'FY 2025–26',
        activityValue: Number.isFinite(val) ? val : 0,
        activityUnit: selectedParam.unit,
        emissionFactorId: selectedParam.emissionFactor?.factorId,
        calculation: calculationResult,
        remarks: remarksInput,
        evidenceIds: uploadedEvidence.map(e => e.evidenceId),
        status: isDraft ? SubmissionStatus.DRAFT : SubmissionStatus.SUBMITTED,
        submissionId,
      });

      const saved = saveSubmission(newSubmission);
      attachEvidenceToSubmission(saved.evidenceIds, saved.submissionId, user.id);

      if (!isDraft) {
        addSubmissionNotification(saved);
        setSubmissionSuccessData({
          submissionId: saved.submissionId,
          parameterName: selectedParam.name,
          activityValue: saved.activityValue,
          unit: saved.activityUnit,
          co2eFormatted: calculationResult ? `${calculationResult.convertedTonnesCO2e.toFixed(2)} tCO₂e` : 'Not Applicable',
          evidenceCount: saved.evidenceIds.length,
        });
      }

      setRefreshTrigger(prev => prev + 1);
      closeDrawer();
    } catch (err) {
      setFormValidationErrors([err instanceof Error ? err.message : 'Failed to save submission.']);
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Module Title Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            ESG Data Collection Engine
          </span>
          <span className="text-xs text-slate-500">
            Assigned Site Parameters ({allAssignedParameters.length})
          </span>
        </div>
        <h1 className="text-2xl font-bold text-navy-950 mt-1">
          ESG Data Entry
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Enter validated project activity values and upload supporting audit documentation. Emission factors and CO₂e conversions are automated and strictly read-only.
        </p>
      </div>

      {/* ============================================================ */}
      {/* SECTION 8 & 31: TOP SECTION-NAVIGATION BAR */}
      {/* ============================================================ */}
      <nav aria-label="ESG Sections" className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* SCOPE 1 TAB */}
          <Link
            to="/project-user/esg-data/scope-1"
            className={`p-3.5 rounded-lg border text-left transition-all ${
              activeScope === Scope.SCOPE_1
                ? 'bg-blue-50 border-blue-600 shadow-xs'
                : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeScope === Scope.SCOPE_1 ? 'text-blue-900' : 'text-slate-600'}`}>
                Scope 1
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                activeScope === Scope.SCOPE_1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {tabProgress.scope1.completed}/{tabProgress.scope1.total}
              </span>
            </div>
            <p className="text-xs font-semibold text-navy-900 mt-1">Direct GHG Emissions</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Combustion &amp; mobile equipment</p>
          </Link>

          {/* SCOPE 2 TAB */}
          <Link
            to="/project-user/esg-data/scope-2"
            className={`p-3.5 rounded-lg border text-left transition-all ${
              activeScope === Scope.SCOPE_2
                ? 'bg-blue-50 border-blue-600 shadow-xs'
                : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeScope === Scope.SCOPE_2 ? 'text-blue-900' : 'text-slate-600'}`}>
                Scope 2
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                activeScope === Scope.SCOPE_2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {tabProgress.scope2.completed}/{tabProgress.scope2.total}
              </span>
            </div>
            <p className="text-xs font-semibold text-navy-900 mt-1">Purchased Energy</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Grid electricity &amp; utilities</p>
          </Link>

          {/* SCOPE 3 TAB */}
          <Link
            to="/project-user/esg-data/scope-3"
            className={`p-3.5 rounded-lg border text-left transition-all ${
              activeScope === Scope.SCOPE_3
                ? 'bg-blue-50 border-blue-600 shadow-xs'
                : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeScope === Scope.SCOPE_3 ? 'text-blue-900' : 'text-slate-600'}`}>
                Scope 3
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                activeScope === Scope.SCOPE_3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {tabProgress.scope3.completed}/{tabProgress.scope3.total}
              </span>
            </div>
            <p className="text-xs font-semibold text-navy-900 mt-1">Value Chain Emissions</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Commuting, logistics &amp; travel</p>
          </Link>

          {/* ADDITIONAL SECTION C TAB */}
          <Link
            to="/project-user/esg-data/additional"
            className={`p-3.5 rounded-lg border text-left transition-all ${
              activeScope === Scope.SECTION_C
                ? 'bg-blue-50 border-blue-600 shadow-xs'
                : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeScope === Scope.SECTION_C ? 'text-blue-900' : 'text-slate-600'}`}>
                Additional Section C
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                activeScope === Scope.SECTION_C ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {tabProgress.additional.completed}/{tabProgress.additional.total}
              </span>
            </div>
            <p className="text-xs font-semibold text-navy-900 mt-1">Other BRSR/ESG Indicators</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Water, waste &amp; safety metrics</p>
          </Link>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* SECTION 9: DATA ENTRY DATE (MANDATORY ON EVERY SECTION) */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-800 shrink-0">
            <CalendarCheck2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                Data Entry Date
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 size={12} /> Today's Date Verified
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Data can only be submitted for today's date ({formatDisplayDate(todayISO)}).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="data-entry-date-input" className="text-xs font-medium text-slate-500">
            Selected:
          </label>
          <input
            id="data-entry-date-input"
            type="date"
            value={dataEntryDate}
            min={todayISO}
            max={todayISO}
            onChange={(e) => handleDateChange(e.target.value)}
            className="input-field text-xs py-1.5 px-3 font-mono font-bold text-navy-900 bg-slate-50 border-slate-300"
          />
        </div>
      </div>

      {dateError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{dateError}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTIONS 10, 13, 14, 15: PARAMETER TABLE */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-navy-950">
              {activeScope === Scope.SCOPE_1 && 'Scope 1 — Direct GHG Emissions'}
              {activeScope === Scope.SCOPE_2 && 'Scope 2 — Purchased Energy'}
              {activeScope === Scope.SCOPE_3 && 'Scope 3 — Value Chain Emissions'}
              {activeScope === Scope.SECTION_C && 'Additional Section C — ESG/BRSR Indicators'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned parameters for {project?.name ?? 'Zojila Tunnel Project'} · Reporting Period: {project?.reportingPeriod ?? 'FY 2025–26'}
            </p>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            {activeParameters.length} Parameter{activeParameters.length === 1 ? '' : 's'} assigned
          </span>
        </div>

        {activeParameters.length === 0 ? (
          <div className="p-12 text-center">
            <Info size={28} className="mx-auto text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-navy-900">No parameters assigned in this section</p>
            <p className="text-xs text-slate-500 mt-1">Contact your Project Supervisor Rajesh Sharma for parameter allocation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 uppercase text-[11px] font-semibold text-slate-600 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Parameter</th>
                  <th className="py-3 px-4 max-w-xs">Definition</th>
                  <th className="py-3 px-4 text-right">Activity Data</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Emission Factor</th>
                  <th className="py-3 px-4 text-right">CO₂e Generated</th>
                  <th className="py-3 px-4 text-center">Evidence</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {activeParameters.map(param => {
                  const paramId = param.parameterId ?? param.code;
                  const submission = submissions.find(s => s.parameterId === paramId);
                  const ef = param.emissionFactor;
                  const efDisplay = ef
                    ? `${ef.factorValue ?? ef.factor} ${ef.unit}`
                    : 'Not Applicable';

                  const co2eDisplay = submission?.calculation
                    ? `${submission.calculation.convertedTonnesCO2e.toFixed(2)} tCO₂e`
                    : param.calculationRequired
                    ? '—'
                    : 'Not Applicable';

                  const status = submission?.status ?? SubmissionStatus.DRAFT;
                  const hasStarted = Boolean(submission);

                  return (
                    <tr key={paramId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-navy-950">
                        {param.name}
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                          {paramId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed text-[11px]">
                        {param.description ?? 'Standard indicator collection'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-navy-900">
                        {submission && submission.activityValue > 0
                          ? submission.activityValue.toLocaleString()
                          : <span className="text-slate-400 font-normal italic">[Enter value]</span>
                        }
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {param.unit}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {efDisplay}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-navy-900">
                        {co2eDisplay}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {submission && submission.evidenceIds.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            <FileText size={12} /> {submission.evidenceIds.length} {submission.evidenceIds.length === 1 ? 'file' : 'files'}
                          </span>
                        ) : param.requiresEvidence ? (
                          <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Upload
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Optional</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <ProjectUserStatusBadge status={hasStarted ? status : SubmissionStatus.DRAFT} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditDrawer(paramId, 'edit')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                          >
                            {hasStarted ? 'Edit' : 'Enter Data'}
                          </button>

                          {hasStarted && (
                            <button
                              type="button"
                              onClick={() => openEditDrawer(paramId, 'view')}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              <Eye size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* SECTIONS 11 & 12: PARAMETER DATA ENTRY DRAWER / MODAL */}
      {/* ============================================================ */}
      {activeDrawerParamId && selectedParam && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-slate-950/55 backdrop-blur-[2px] animate-fade-in" onMouseDown={event => { if (event.target === event.currentTarget) closeDrawer(); }}>
          <div className="flex h-full max-h-screen w-full max-w-2xl flex-col border-l border-slate-200 bg-slate-50 shadow-2xl">
            {/* Drawer Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-800 ring-1 ring-inset ring-blue-200">
                      {selectedParam.scope} · Data Entry
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">{selectedParam.parameterId ?? selectedParam.code}</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-navy-950">
                    {selectedParam.name}
                  </h3>
                </div>

                <button
                  onClick={closeDrawer}
                  aria-label="Close data entry form"
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body Form */}
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
                {/* Validation Feedback */}
                {formValidationErrors.length > 0 && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm space-y-1">
                    <div className="flex items-center gap-2 font-bold text-rose-900">
                      <AlertCircle size={15} /> Submission Validation Issue
                    </div>
                    {formValidationErrors.map((err, i) => (
                      <p key={i}>• {err}</p>
                    ))}
                  </div>
                )}

                {/* 1. Parameter Definition (READ ONLY) */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="block text-[10px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                    Parameter Definition (Read-Only)
                  </span>
                  <p className="mt-2 text-sm leading-6 text-navy-900">
                    {selectedParam.description || 'Verified site indicator per BRSR Core compliance parameters.'}
                  </p>
                </div>

                {/* 2. Activity Data & Unit */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-navy-900">
                      Activity Data <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      disabled={drawerMode === 'view'}
                      value={activityInput}
                      onChange={(e) => setActivityInput(e.target.value)}
                      placeholder="e.g. 12500"
                      className="input-field w-full rounded-xl border-slate-300 bg-white px-4 py-3 text-base font-semibold shadow-sm transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    <span className="mt-2 block text-xs text-slate-500">
                      Enter measured consumption/value.
                    </span>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-navy-900">
                      Configured Unit (Read-Only)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={selectedParam.unit}
                      className="input-field w-full rounded-xl border-slate-200 bg-slate-100 px-4 py-3 font-mono font-semibold text-slate-700"
                    />
                    <span className="mt-2 block text-xs text-slate-500">
                      Unit configured by Project Supervisor.
                    </span>
                  </div>
                </div>

                {/* 3. Reporting Period (READ ONLY) */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <label className="mb-2 block text-sm font-semibold text-navy-900">
                    Reporting Period (Read-Only)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={project?.reportingPeriod ?? 'FY 2025–26'}
                    className="input-field w-full rounded-xl border-slate-200 bg-slate-100 px-4 py-3 font-mono text-sm text-slate-700"
                  />
                </div>

                {/* 4. Emission Factor Card (READ ONLY) */}
                {selectedParam.calculationRequired ? (
                  <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-950">
                        Configured Emission Factor (Read-Only)
                      </span>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Tier 1 Approved
                      </span>
                    </div>

                    <div className="text-2xl font-bold font-mono tracking-tight text-blue-900">
                      {selectedParam.emissionFactor?.factorValue ?? selectedParam.emissionFactor?.factor ?? 0}{' '}
                      <span className="text-xs font-normal text-slate-600">
                        {selectedParam.emissionFactor?.unit ?? 'kgCO₂e/unit'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200/60 text-[11px] text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Source</span>
                        <strong>{selectedParam.emissionFactor?.source ?? 'IPCC / CEA Baseline'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Reporting Year</span>
                        <strong>{selectedParam.emissionFactor?.reportingYear ?? 'FY 2025–26'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Methodology</span>
                        <strong>{selectedParam.emissionFactor?.methodology ?? 'Tier 1 Default'}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
                    <strong>Note:</strong> Emission calculation is <strong>Not Applicable</strong> for this indicator. Only qualitative/quantitative volume is recorded.
                  </div>
                )}

                {/* 5. Automatic CO₂e Calculation Box (READ ONLY) */}
                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950">
                      Automatic CO₂e Calculation
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                      System Calculated
                    </span>
                  </div>

                  {selectedParam.calculationRequired ? (
                    calculationResult ? (
                      <div className="mt-2 space-y-1">
                        <div className="text-2xl font-bold font-mono tracking-tight text-emerald-900">
                          {calculationResult.convertedTonnesCO2e.toFixed(2)} tCO₂e
                          <span className="text-xs font-normal text-slate-500 ml-2">
                            ({calculationResult.rawKgCO2e.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono">
                          Formula: {activityInput} {selectedParam.unit} × {selectedParam.emissionFactor?.factorValue} {selectedParam.emissionFactor?.unit} = {calculationResult.convertedTonnesCO2e.toFixed(2)} tonnes
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-slate-500 italic">
                        Enter activity data above to automatically calculate total CO₂e generated.
                      </div>
                    )
                  ) : (
                    <div className="mt-2 text-xs font-semibold text-slate-700">
                      CO₂e: Not Applicable
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2">
                    * The Project User cannot manually enter or modify CO₂e figures.
                  </p>
                </div>

                {/* 6. Remarks */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <label className="mb-2 block text-sm font-semibold text-navy-900">
                    Remarks / Operational Notes
                  </label>
                  <textarea
                    rows={4}
                    disabled={drawerMode === 'view'}
                    value={remarksInput}
                    onChange={(e) => setRemarksInput(e.target.value)}
                    placeholder="Provide details regarding the data source, meter readings, or site register..."
                    className="input-field w-full resize-y rounded-xl px-4 py-3 text-sm leading-6"
                  />
                </div>

                {/* 7. Evidence Upload Section (SECTION 12) */}
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-navy-950">
                        Supporting Evidence Documents
                      </span>
                      {selectedParam.requiresEvidence && (
                        <span className="text-rose-600 text-xs font-bold ml-1">* Required</span>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        Supported: PDF, JPG, JPEG, PNG, XLSX, DOCX (Max 25 MB).
                      </p>
                    </div>

                    {drawerMode === 'edit' && (
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100">
                        <UploadCloud size={14} />
                        <span>+ Upload Evidence</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.xlsx,.docx"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files)}
                        />
                      </label>
                    )}
                  </div>

                  {/* Uploaded Evidence Cards */}
                  {uploadedEvidence.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center text-sm text-slate-500">
                      <UploadCloud size={20} className="mx-auto mb-2 text-slate-400" />
                      No evidence documents attached yet. Upload files to support this entry.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {uploadedEvidence.map((ev) => (
                        <div
                          key={ev.evidenceId}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs shadow-sm space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <FileCheck size={16} className="text-emerald-600 shrink-0" />
                              <div>
                                <span className="font-bold text-navy-900 block truncate">
                                  Original: {ev.originalFilename}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 block truncate">
                                  System: {ev.systemFilename}
                                </span>
                              </div>
                            </div>

                            {drawerMode === 'edit' && (
                              <button
                                type="button"
                                onClick={() => handleRemoveEvidence(ev.evidenceId)}
                                className="text-rose-600 hover:text-rose-800 p-1"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                            <span>ID: <strong className="font-mono text-slate-700">{ev.evidenceId}</strong></span>
                            <span>Type: <strong className="uppercase">{ev.fileExtension || 'PDF'}</strong></span>
                            <span>Size: <strong>{(ev.fileSize / (1024 * 1024)).toFixed(2)} MB</strong></span>
                            <span>Uploaded: <strong>{formatDisplayDate(ev.uploadedAt.slice(0, 10))}</strong></span>
                            <span className="ml-auto inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                              ✓ Traceable
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            {/* Drawer Footer Actions (Save Draft & Submit) */}
            <div className="z-10 flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4 shadow-[0_-8px_20px_rgba(15,23,42,0.06)] sm:px-6">
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Cancel
              </button>

              {drawerMode === 'edit' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={savingStatus}
                    onClick={() => handleSave(true)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-slate-50"
                  >
                    Save Draft
                  </button>

                  <button
                    type="button"
                    disabled={savingStatus}
                    onClick={() => handleSave(false)}
                    className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingStatus ? 'Submitting...' : 'Review & Submit'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 19: SUBMISSION SUCCESS DIALOG */}
      {/* ============================================================ */}
      {submissionSuccessData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Audit Trail Recorded
              </span>
              <h3 className="text-xl font-bold text-navy-950 mt-1.5">
                Submission Successful
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Your activity data and supporting evidence have been registered for Project Supervisor verification.
              </p>
            </div>

            {/* Submission Detail Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Submission ID:</span>
                <strong className="font-mono text-blue-700">{submissionSuccessData.submissionId}</strong>
              </div>

              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Parameter:</span>
                <strong className="text-navy-900">{submissionSuccessData.parameterName}</strong>
              </div>

              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Activity Data:</span>
                <strong className="font-mono text-navy-900">
                  {submissionSuccessData.activityValue.toLocaleString()} {submissionSuccessData.unit}
                </strong>
              </div>

              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">CO₂e Generated:</span>
                <strong className="font-mono text-emerald-800">{submissionSuccessData.co2eFormatted}</strong>
              </div>

              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Evidence Attached:</span>
                <strong>{submissionSuccessData.evidenceCount} files</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                  Submitted
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubmissionSuccessData(null)}
                className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccessData(null);
                  navigate('/project-user/submissions');
                }}
                className="flex-1 py-2 px-4 bg-navy-900 text-white rounded-lg text-xs font-bold hover:bg-navy-800 transition-colors shadow-xs"
              >
                View in Submissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
