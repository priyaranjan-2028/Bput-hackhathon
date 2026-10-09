import { SubmissionStatus } from '../types';

export const projectUserStatusConfig: Partial<Record<SubmissionStatus, { label: string; styles: string; description: string }>> = {
  [SubmissionStatus.DRAFT]: { label: 'Draft', styles: 'bg-slate-100 text-slate-700', description: 'Saved but not sent for verification.' },
  [SubmissionStatus.SUBMITTED]: { label: 'Submitted', styles: 'bg-blue-50 text-blue-700 border border-blue-200', description: 'Sent to the Project Supervisor.' },
  [SubmissionStatus.UNDER_REVIEW]: { label: 'Under Review', styles: 'bg-amber-50 text-amber-700 border border-amber-200', description: 'Being reviewed by the Project Supervisor.' },
  [SubmissionStatus.CORRECTION_REQUIRED]: { label: 'Correction Required', styles: 'bg-orange-50 text-orange-700 border border-orange-200', description: 'Changes are required before approval.' },
  [SubmissionStatus.CORRECTION_REQUESTED]: { label: 'Correction Required', styles: 'bg-orange-50 text-orange-700 border border-orange-200', description: 'Changes are required before approval.' },
  [SubmissionStatus.REJECTED]: { label: 'Rejected', styles: 'bg-red-50 text-red-700 border border-red-200', description: 'This submission was rejected.' },
  [SubmissionStatus.APPROVED]: { label: 'Approved', styles: 'bg-emerald-50 text-emerald-700 border border-emerald-200', description: 'Approved by the Project Supervisor.' },
  [SubmissionStatus.VERIFIED_LEVEL_1]: { label: 'Approved', styles: 'bg-emerald-50 text-emerald-700 border border-emerald-200', description: 'Approved by the Project Supervisor.' },
  [SubmissionStatus.CONSOLIDATED]: { label: 'Consolidated', styles: 'bg-teal-50 text-teal-700 border border-teal-200', description: 'Included in a consolidated reporting record.' },
  [SubmissionStatus.CONSOLIDATED_PROJECT]: { label: 'Consolidated', styles: 'bg-teal-50 text-teal-700 border border-teal-200', description: 'Included in project consolidation.' },
  [SubmissionStatus.FORWARDED]: { label: 'Forwarded', styles: 'bg-indigo-50 text-indigo-700 border border-indigo-200', description: 'Forwarded to the next reporting level.' },
};

export function projectUserStatusLabel(status: SubmissionStatus): string {
  return projectUserStatusConfig[status]?.label ?? status.replaceAll('_', ' ');
}

export function projectUserStatusStyle(status: SubmissionStatus): string {
  return projectUserStatusConfig[status]?.styles ?? 'bg-slate-100 text-slate-700';
}
