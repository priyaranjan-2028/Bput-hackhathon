import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProjectById } from '../../data/mockData';
import { getAssignedParameters } from '../../services/parameterService';
import { getUserSubmissions } from '../../services/submissionService';
import { getUserEvidence } from '../../services/evidenceService';
import { Scope, SubmissionStatus } from '../../types';
import ProjectUserStatusBadge from '../../components/project-user/StatusBadge';
import { getTodayISO, formatDisplayDate } from '../../utils/dateUtils';
import { ArrowRight, CalendarDays, ChevronDown, CircleCheck, ClipboardList, FileUp } from 'lucide-react';

const sectionDefinitions = [
  { scope: Scope.SCOPE_1, label: 'Scope 1', title: 'Direct GHG Emissions', tone: 'emerald', card: 'border-emerald-200 bg-emerald-50/50 text-emerald-800', icon: 'text-emerald-600', progress: 'bg-emerald-500', header: 'border-emerald-200', headerBg: 'bg-emerald-50/70', headerIcon: 'text-emerald-700' },
  { scope: Scope.SCOPE_2, label: 'Scope 2', title: 'Purchased Energy', tone: 'blue', card: 'border-blue-200 bg-blue-50/50 text-blue-800', icon: 'text-blue-600', progress: 'bg-blue-500', header: 'border-blue-200', headerBg: 'bg-blue-50/70', headerIcon: 'text-blue-700' },
  { scope: Scope.SCOPE_3, label: 'Scope 3', title: 'Value Chain Emissions', tone: 'violet', card: 'border-violet-200 bg-violet-50/50 text-violet-800', icon: 'text-violet-600', progress: 'bg-violet-500', header: 'border-violet-200', headerBg: 'bg-violet-50/70', headerIcon: 'text-violet-700' },
  { scope: Scope.SECTION_C, label: 'Additional Data', title: 'Other Section C', tone: 'cyan', card: 'border-cyan-200 bg-cyan-50/50 text-cyan-800', icon: 'text-cyan-600', progress: 'bg-cyan-500', header: 'border-cyan-200', headerBg: 'bg-cyan-50/70', headerIcon: 'text-cyan-700' },
] as const;

const scopeRoute = (scope: Scope) => scope === Scope.SCOPE_1
  ? 'scope-1'
  : scope === Scope.SCOPE_2
    ? 'scope-2'
    : scope === Scope.SCOPE_3
      ? 'scope-3'
      : 'other';

export default function ProjectUserDataEntryPage() {
  const { user } = useAuth();
  if (!user) return null;
  const project = user.projectId ? getProjectById(user.projectId) : undefined;
  const parameters = getAssignedParameters(user.id);
  const submissions = project ? getUserSubmissions(user.id, project.id) : [];
  const evidence = getUserEvidence(user.id);

  const latestFor = (parameterId: string) => submissions
    .filter(submission => submission.parameterId === parameterId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

  const sections = sectionDefinitions.map(section => {
    const sectionParameters = parameters.filter(parameter => section.scope === Scope.SECTION_C
      ? parameter.scope === Scope.SECTION_C || parameter.scope === Scope.OTHER_ENVIRONMENTAL
      : parameter.scope === section.scope);
    const completedCount = sectionParameters.filter(parameter => {
      const submission = latestFor(parameter.parameterId ?? parameter.code);
      return submission && [
        SubmissionStatus.SUBMITTED,
        SubmissionStatus.UNDER_REVIEW,
        SubmissionStatus.APPROVED,
        SubmissionStatus.VERIFIED_LEVEL_1,
        SubmissionStatus.CONSOLIDATED,
        SubmissionStatus.CONSOLIDATED_PROJECT,
      ].includes(submission.status);
    }).length;
    return { ...section, parameters: sectionParameters, completedCount };
  });

  const formLink = (scope: Scope, parameterId: string, submissionId?: string) => {
    const query = new URLSearchParams({ parameter: parameterId });
    if (submissionId) query.set('draft', submissionId);
    return `/section-c/${scopeRoute(scope)}?${query.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-esg-700">Section C · Data entry</p>
          <h1 className="mt-1 text-2xl font-bold text-navy-900">ESG Data Submission</h1>
          <p className="mt-1 text-sm text-slate-600">Choose an assigned indicator to open its guided submission form.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-lg border border-slate-200 px-3 py-2">
            <p className="text-[11px] text-slate-500">Project</p>
            <p className="text-sm font-semibold text-navy-900">{project?.name ?? 'No project assigned'}</p>
          </div>
          <div className="rounded-lg border border-slate-200 px-3 py-2">
            <p className="flex items-center gap-1 text-[11px] text-slate-500"><CalendarDays size={12} /> Data Entry Date</p>
            <p className="text-sm font-semibold text-navy-900">{formatDisplayDate(getTodayISO())} <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">Today</span></p>
            <p className="mt-1 text-[10px] text-slate-500">Submissions accept today's date only</p>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Section completion">
        {sections.map(section => (
          <a key={section.scope} href={`#${scopeRoute(section.scope)}`} className={`rounded-xl border p-4 transition hover:shadow-sm ${section.card}`}>
            <div className="flex items-center justify-between gap-2">
              <div><p className="text-sm font-semibold">{section.label}</p><p className="text-xs opacity-80">{section.title}</p></div>
              <CircleCheck size={18} className={section.icon} />
            </div>
            <p className="mt-3 text-xs text-slate-600">{section.completedCount} / {section.parameters.length} completed</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className={`h-full ${section.progress}`} style={{ width: `${section.parameters.length ? section.completedCount / section.parameters.length * 100 : 0}%` }} /></div>
          </a>
        ))}
      </section>

      {!project && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">A project must be assigned to your account before you can submit data. Contact your Project Supervisor.</div>}

      {sections.map((section, sectionIndex) => (
        <details id={scopeRoute(section.scope)} key={section.scope} open={sectionIndex === 0} className={`group overflow-hidden rounded-xl border bg-white shadow-sm ${section.header}`}>
          <summary className={`flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 sm:px-5 ${section.headerBg}`}>
            <div className="flex items-center gap-3">
              <span className={`rounded-lg bg-white p-2 ${section.headerIcon}`}><ClipboardList size={18} /></span>
              <div><h2 className="font-semibold text-navy-900">{section.label} — {section.title}</h2><p className="text-xs text-slate-600">{section.parameters.length} assigned indicators</p></div>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-600"><span>{section.completedCount} / {section.parameters.length} completed</span><ChevronDown size={16} className="transition group-open:rotate-180" /></div>
          </summary>
          {section.parameters.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Parameter</th><th className="px-3 py-3">Definition</th><th className="px-3 py-3">Activity Data</th><th className="px-3 py-3">Unit</th><th className="px-3 py-3">Emission Factor</th><th className="px-3 py-3">CO₂e Generated</th><th className="px-3 py-3">Evidence</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {section.parameters.map(parameter => {
                    const parameterId = parameter.parameterId ?? parameter.code;
                    const submission = latestFor(parameterId);
                    const factor = parameter.emissionFactor;
                    const factorValue = factor?.factorValue ?? factor?.factor;
                    const isEditable = !submission || [
                      SubmissionStatus.DRAFT,
                      SubmissionStatus.CORRECTION_REQUIRED,
                      SubmissionStatus.CORRECTION_REQUESTED,
                      SubmissionStatus.REJECTED,
                      SubmissionStatus.REVISION_REQUESTED,
                    ].includes(submission.status);
                    const entryScope = parameter.scope;
                    return (
                      <tr key={parameterId} className="align-middle hover:bg-slate-50/70">
                        <td className="px-3 py-3"><span className="font-semibold text-navy-900">{parameter.name}</span><span className="mt-1 block font-mono text-[10px] text-slate-500">{parameter.code}</span></td>
                        <td className="max-w-48 px-3 py-3 text-slate-600">{parameter.description ?? parameter.category}</td>
                        <td className="px-3 py-3 font-medium text-navy-800">{submission ? submission.activityValue.toLocaleString() : <span className="text-slate-400">Enter value</span>}</td>
                        <td className="px-3 py-3 text-slate-600">{parameter.unit}</td>
                        <td className="px-3 py-3 text-slate-600">{factorValue !== undefined ? `${factorValue} ${factor?.unit ?? ''}` : '—'}</td>
                        <td className="px-3 py-3 font-medium text-navy-800">{submission?.calculation ? `${submission.calculation.convertedTonnesCO2e.toLocaleString(undefined, { maximumFractionDigits: 3 })} tCO₂e` : '—'}</td>
                        <td className="px-3 py-3">
                          {submission?.evidenceIds.length ? <span className="inline-flex items-center gap-1 text-slate-600"><FileUp size={13} /> {submission.evidenceIds.filter(id => evidence.some(item => item.evidenceId === id)).length} file(s)</span> : parameter.requiresEvidence ? <span className="text-amber-700">Required</span> : <span className="text-slate-400">Optional</span>}
                        </td>
                        <td className="px-3 py-3"><ProjectUserStatusBadge status={submission?.status ?? SubmissionStatus.DRAFT} /></td>
                        <td className="px-3 py-3">
                          {isEditable ? <Link to={formLink(entryScope, parameterId, submission?.status === SubmissionStatus.DRAFT ? submission.submissionId : undefined)} className="inline-flex items-center gap-1 rounded-md border border-blue-200 px-2.5 py-1.5 font-semibold text-blue-700 hover:bg-blue-50">{submission ? 'Edit' : 'Enter data'} <ArrowRight size={12} /></Link>
                            : submission ? <Link to={`/submissions/${encodeURIComponent(submission.submissionId)}`} className="font-semibold text-blue-700 hover:underline">View</Link>
                              : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <p className="p-5 text-sm text-slate-600">There are no assigned indicators in this section.</p>}
        </details>
      ))}

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-xs text-slate-600">
        <span>Each entry opens a guided form with date confirmation, supporting evidence, automatic CO₂e calculation, and a review step.</span>
        <Link to="/submissions" className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline">View submission history <ArrowRight size={14} /></Link>
      </footer>
    </div>
  );
}
