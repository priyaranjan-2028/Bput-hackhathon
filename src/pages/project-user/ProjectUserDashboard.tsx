import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardList, CheckCircle2, Clock, AlertTriangle,
  UploadCloud, Leaf, ArrowRight, UserCheck, Building2,
  Calendar, ShieldCheck, ChevronRight, FileEdit, Eye, AlertCircle
} from 'lucide-react';
import { getProjectById, getBusinessUnitById, getSubsidiaryById, getUserById } from '../../data/mockData';
import { getUserSubmissions } from '../../services/submissionService';
import { getUserEvidence } from '../../services/evidenceService';
import { getAssignedParameters } from '../../services/parameterService';
import { Scope, SubmissionStatus } from '../../types';

export default function ProjectUserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const project = user.projectId ? getProjectById(user.projectId) : undefined;
  const businessUnit = user.businessUnitId ? getBusinessUnitById(user.businessUnitId) : undefined;
  const subsidiary = user.subsidiaryId ? getSubsidiaryById(user.subsidiaryId) : undefined;
  const supervisor = project?.supervisorId ? getUserById(project.supervisorId) : undefined;
  const submissions = project ? getUserSubmissions(user.id, project.id) : [];
  const evidence = getUserEvidence(user.id);
  const parameters = getAssignedParameters(user.id);
  const completedCount = submissions.filter(item => ![SubmissionStatus.DRAFT, SubmissionStatus.CORRECTION_REQUIRED, SubmissionStatus.CORRECTION_REQUESTED, SubmissionStatus.REJECTED].includes(item.status)).length;
  const pendingCount = submissions.filter(item => [SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW].includes(item.status)).length;
  const correctionCount = submissions.filter(item => [SubmissionStatus.CORRECTION_REQUIRED, SubmissionStatus.CORRECTION_REQUESTED, SubmissionStatus.REJECTED].includes(item.status)).length;
  const totalCO2e = submissions.reduce((sum, item) => sum + (item.calculation?.convertedTonnesCO2e ?? 0), 0);

  // Enterprise KPI values matching MEIL ESG compliance specification
  const kpiMetrics = [
    {
      title: 'Assigned Parameters',
      value: String(parameters.length),
      subtext: 'Configured by supervisor',
      icon: ClipboardList,
      accent: 'border-blue-500/30 bg-blue-50/50 text-blue-700',
      badgeClass: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Completed',
      value: String(completedCount),
      subtext: 'Verified & approved',
      icon: CheckCircle2,
      accent: 'border-emerald-500/30 bg-emerald-50/50 text-emerald-700',
      badgeClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      title: 'Pending',
      value: String(pendingCount),
      subtext: 'Awaiting data entry / review',
      icon: Clock,
      accent: 'border-amber-500/30 bg-amber-50/50 text-amber-700',
      badgeClass: 'bg-amber-100 text-amber-800',
    },
    {
      title: 'Correction Required',
      value: String(correctionCount),
      subtext: 'Action required by you',
      icon: AlertTriangle,
      accent: 'border-rose-500/30 bg-rose-50/50 text-rose-700',
      badgeClass: 'bg-rose-100 text-rose-800 font-bold',
    },
    {
      title: 'Evidence Uploaded',
      value: String(evidence.length),
      subtext: 'Traceable audit files',
      icon: UploadCloud,
      accent: 'border-indigo-500/30 bg-indigo-50/50 text-indigo-700',
      badgeClass: 'bg-indigo-100 text-indigo-800',
    },
    {
      title: 'CO₂e Generated',
      value: totalCO2e.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      unit: 'tCO₂e',
      subtext: 'System calculated footprint',
      icon: Leaf,
      accent: 'border-teal-500/30 bg-teal-50/50 text-teal-700',
      badgeClass: 'bg-teal-100 text-teal-800',
    },
  ];

  // Section Progress specified in prompt
  const sectionProgress = [
    {
      scope: 'Scope 1',
      title: 'Direct GHG Emissions',
      percentage: 85,
      route: '/project-user/esg-data/scope-1',
      status: 'In Progress (4/5 parameters)',
      color: 'bg-blue-600',
    },
    {
      scope: 'Scope 2',
      title: 'Purchased Energy',
      percentage: 95,
      route: '/project-user/esg-data/scope-2',
      status: 'Near Completion (3/3 parameters)',
      color: 'bg-emerald-600',
    },
    {
      scope: 'Scope 3',
      title: 'Value Chain Emissions',
      percentage: 65,
      route: '/project-user/esg-data/scope-3',
      status: 'Action Needed (3/5 parameters)',
      color: 'bg-amber-500',
    },
    {
      scope: 'Additional Section C',
      title: 'Other BRSR/ESG Indicators',
      percentage: 75,
      route: '/project-user/esg-data/additional',
      status: 'In Progress (3/4 indicators)',
      color: 'bg-indigo-600',
    },
  ];
  sectionProgress.forEach(section => {
    const scope = section.scope === 'Scope 1' ? Scope.SCOPE_1 : section.scope === 'Scope 2' ? Scope.SCOPE_2 : section.scope === 'Scope 3' ? Scope.SCOPE_3 : Scope.SECTION_C;
    const totalForScope = parameters.filter(parameter => parameter.scope === scope || (scope === Scope.SECTION_C && parameter.scope === Scope.OTHER_ENVIRONMENTAL)).length;
    const completedForScope = submissions.filter(submission => submission.scope === scope && ![SubmissionStatus.DRAFT, SubmissionStatus.CORRECTION_REQUIRED, SubmissionStatus.CORRECTION_REQUESTED, SubmissionStatus.REJECTED].includes(submission.status)).length;
    section.percentage = totalForScope ? Math.min(100, Math.round(completedForScope / totalForScope * 100)) : 0;
    section.status = `${completedForScope}/${totalForScope} parameters completed`;
  });

  // Action items specified in Section 6
  const actionRequiredItems = [
    {
      id: 'ACT-01',
      status: 'Correction Required',
      parameter: 'Employee Commuting',
      scope: 'Scope 3',
      comment: 'Please upload the travel statement.',
      actionLabel: 'Correct Now',
      actionUrl: '/project-user/corrections',
      severity: 'high',
    },
    {
      id: 'ACT-02',
      status: 'Pending',
      parameter: 'Purchased Electricity',
      scope: 'Scope 2',
      comment: 'Monthly electricity bill activity data input required.',
      actionLabel: 'Enter Data',
      actionUrl: '/project-user/esg-data/scope-2',
      severity: 'medium',
    },
    {
      id: 'ACT-03',
      status: 'Submitted',
      parameter: 'Waste Generated',
      scope: 'Additional Section C',
      comment: 'Under review by Project Supervisor Rajesh Sharma.',
      actionLabel: 'View Submission',
      actionUrl: '/project-user/submissions',
      severity: 'low',
    },
  ];
  const liveActionItems = submissions.filter(item => [SubmissionStatus.CORRECTION_REQUIRED, SubmissionStatus.CORRECTION_REQUESTED, SubmissionStatus.SUBMITTED].includes(item.status)).map(item => {
    const parameter = parameters.find(candidate => (candidate.parameterId ?? candidate.code) === item.parameterId);
    const correction = [SubmissionStatus.CORRECTION_REQUIRED, SubmissionStatus.CORRECTION_REQUESTED].includes(item.status);
    return { id: item.submissionId, status: correction ? 'Correction Required' : 'Submitted', parameter: parameter?.name ?? item.parameterId, scope: item.scope.replaceAll('_', ' '), comment: item.supervisorNotes ?? (correction ? 'Please update this submission and supporting evidence.' : 'Awaiting Project Supervisor verification.'), actionLabel: correction ? 'Correct Now' : 'View Submission', actionUrl: correction ? '/project-user/corrections' : '/project-user/submissions' };
  });
  const dashboardActions = liveActionItems.length ? liveActionItems.slice(0, 4) : actionRequiredItems;

  // Recent activity events specified in Section 6
  const recentActivities = [
    {
      id: 'REC-01',
      message: 'You submitted Diesel Consumption.',
      timestamp: 'Today, 14:35',
      type: 'submission',
      icon: CheckCircle2,
      iconClass: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'REC-02',
      message: 'Project Supervisor approved Purchased Electricity.',
      timestamp: 'Yesterday, 16:20',
      type: 'approval',
      icon: ShieldCheck,
      iconClass: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'REC-03',
      message: 'Correction requested for Employee Commuting.',
      timestamp: 'Yesterday, 11:45',
      type: 'correction',
      icon: AlertTriangle,
      iconClass: 'text-rose-600 bg-rose-50',
    },
    {
      id: 'REC-04',
      message: 'Water Consumption evidence uploaded.',
      timestamp: '07 Oct 2026, 10:15',
      type: 'evidence',
      icon: UploadCloud,
      iconClass: 'text-indigo-600 bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Context Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Enterprise ESG &amp; BRSR Compliance
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {project?.name ?? 'Assigned Project'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-navy-950 mt-1.5">
              Project User Data Collection Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              "What data do I need to complete?" — Overview of your assigned ESG activity records and verification status.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/project-user/esg-data/scope-1"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <FileEdit size={15} />
              Open ESG Data Entry
            </Link>
            <Link
              to="/project-user/corrections"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold rounded-lg transition-colors"
            >
              <AlertTriangle size={15} />
              View Corrections (2)
            </Link>
          </div>
        </div>

        {/* Project Context Metadata Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 pt-5 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Assigned Project</span>
            <span className="font-bold text-navy-900 mt-0.5 block truncate">
              {project?.name ?? 'Zojila Tunnel Project'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Business Unit</span>
            <span className="font-bold text-navy-900 mt-0.5 block truncate">
              {businessUnit?.name ?? 'Transportation'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Subsidiary</span>
            <span className="font-bold text-navy-900 mt-0.5 block truncate">
              {subsidiary?.name ?? 'MEIL Infrastructure'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Reporting Period</span>
            <span className="font-bold text-navy-900 mt-0.5 block font-mono">
              {project?.reportingPeriod ?? 'FY 2025–26'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Project Supervisor</span>
            <span className="font-bold text-navy-900 mt-0.5 block truncate">
              {supervisor?.name ?? 'Rajesh Sharma'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Employee ID</span>
            <span className="font-bold font-mono text-navy-900 mt-0.5 block">
              {user.id || 'USR005'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Assigned Role</span>
            <span className="font-bold text-blue-700 mt-0.5 block">
              Project User
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards (Clean enterprise styling, not excessively large) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {kpiMetrics.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 leading-tight">
                  {kpi.title}
                </span>
                <span className={`p-1.5 rounded-md ${kpi.accent}`}>
                  <Icon size={16} />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-navy-950 font-mono tracking-tight">
                    {kpi.value}
                  </span>
                  {kpi.unit && (
                    <span className="text-xs font-semibold text-slate-500">
                      {kpi.unit}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">
                  {kpi.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Section Progress & Action Required */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Section Progress */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-navy-950">Section Progress</h2>
              <p className="text-xs text-slate-500 mt-0.5">Completion across assigned BRSR / ESG indicators</p>
            </div>
            <Link
              to="/project-user/esg-data/scope-1"
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              Start Entry <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-4 space-y-4">
      {sectionProgress.map((sec) => (
              <div
                key={sec.scope}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-navy-900">{sec.scope}</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="text-slate-600 font-medium">{sec.title}</span>
                  </div>
                  <span className="font-mono font-bold text-navy-900">{sec.percentage}%</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-2.5 w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${sec.color}`}
                    style={{ width: `${sec.percentage}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{sec.status}</span>
                  <Link
                    to={sec.route}
                    className="font-medium text-blue-700 hover:underline flex items-center gap-0.5"
                  >
                    Open <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (7 cols): Action Required */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-navy-950">Action Required</h2>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    3 Items Pending
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parameters requiring your prompt attention, correction, or initial submission
                </p>
              </div>

              <Link
                to="/project-user/corrections"
                className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
              >
                Corrections Hub <ArrowRight size={13} />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {dashboardActions.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.status === 'Correction Required'
                      ? 'border-rose-200 bg-rose-50/40'
                      : item.status === 'Pending'
                      ? 'border-amber-200 bg-amber-50/40'
                      : 'border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.status === 'Correction Required'
                            ? 'bg-rose-600 text-white'
                            : item.status === 'Pending'
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs font-bold text-navy-900">
                        {item.parameter}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({item.scope})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 italic">
                      "{item.comment}"
                    </p>
                  </div>

                  <Link
                    to={item.actionUrl}
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                      item.status === 'Correction Required'
                        ? 'bg-rose-700 text-white hover:bg-rose-800'
                        : item.status === 'Pending'
                        ? 'bg-amber-700 text-white hover:bg-amber-800'
                        : 'bg-navy-900 text-white hover:bg-navy-800'
                    }`}
                  >
                    {item.actionLabel}
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Supervisor approval queue: 1 submission under verification</span>
            <Link to="/project-user/submissions" className="text-blue-700 font-semibold hover:underline">
              View all submissions
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-navy-950">Recent Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Audit log of your recent entries, verifications, and evidence uploads</p>
          </div>

          <Link
            to="/project-user/notifications"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            All Activity Notifications <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-3 divide-y divide-slate-100">
          {recentActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <span className={`p-1.5 rounded-md ${act.iconClass}`}>
                    <Icon size={15} />
                  </span>
                  <span className="font-medium text-navy-900">{act.message}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {act.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
