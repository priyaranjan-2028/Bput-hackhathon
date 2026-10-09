// ============================================================
// MEIL ESG Portal — Verification Service
// Handles audit trail and supervisor verification history
// ============================================================

import { SubmissionStatus } from '../types';
import { ProjectUserVerification } from '../types/projectUser';
import { MEIL_STORAGE_KEYS, readStoredValue, writeStoredValue } from './localStorageService';

export function getVerificationsForSubmission(submissionId: string): ProjectUserVerification[] {
  const allVerifications = readStoredValue<ProjectUserVerification[]>(MEIL_STORAGE_KEYS.verifications, []);
  return allVerifications.filter(v => v.submissionId === submissionId);
}

export function recordVerification(verification: ProjectUserVerification): void {
  const allVerifications = readStoredValue<ProjectUserVerification[]>(MEIL_STORAGE_KEYS.verifications, []);
  allVerifications.unshift(verification);
  writeStoredValue(MEIL_STORAGE_KEYS.verifications, allVerifications);
}

export function formatVerificationStatus(status: SubmissionStatus): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (status) {
    case SubmissionStatus.APPROVED:
    case SubmissionStatus.VERIFIED_LEVEL_1:
    case SubmissionStatus.VERIFIED_LEVEL_2:
    case SubmissionStatus.VERIFIED_LEVEL_3:
    case SubmissionStatus.CONSOLIDATED:
    case SubmissionStatus.CONSOLIDATED_PROJECT:
      return {
        label: 'Approved',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case SubmissionStatus.CORRECTION_REQUIRED:
    case SubmissionStatus.CORRECTION_REQUESTED:
      return {
        label: 'Correction Required',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case SubmissionStatus.UNDER_REVIEW:
      return {
        label: 'Under Review',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        dotClass: 'bg-blue-500',
      };
    case SubmissionStatus.SUBMITTED:
      return {
        label: 'Submitted',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        dotClass: 'bg-indigo-500',
      };
    case SubmissionStatus.REJECTED:
      return {
        label: 'Rejected',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    case SubmissionStatus.DRAFT:
    default:
      return {
        label: 'Draft',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
}
