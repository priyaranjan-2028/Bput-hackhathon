import {
  getParameterById,
  parameterSubmissions as mockSubmissions,
  users,
} from '../data/mockData';
import { Scope, SubmissionStatus } from '../types';
import {
  ProjectUserCalculation,
  ProjectUserSubmission,
  ProjectUserVerification,
} from '../types/projectUser';
import { readStoredValue, PROJECT_USER_STORAGE_KEYS, writeStoredValue } from './localStorageService';
import { UserRole } from '../types';

const statusFor = (status: SubmissionStatus): SubmissionStatus => {
  if (status === SubmissionStatus.CORRECTION_REQUESTED) return SubmissionStatus.CORRECTION_REQUIRED;
  return status;
};

function seedUserSubmissions(userId: string, projectId: string): ProjectUserSubmission[] {
  return mockSubmissions
    .filter(submission => submission.projectId === projectId && (submission.userId === userId || submission.submittedBy === userId))
    .map((submission, index) => {
      const parameter = getParameterById(submission.parameterId);
      const activityValue = submission.activityData ?? submission.value ?? 0;
      const verificationHistory: ProjectUserVerification[] = [];
      const currentStatus = statusFor(submission.status);
      if (currentStatus === SubmissionStatus.APPROVED) {
        verificationHistory.push({
          verificationId: `VER-DEMO-${index + 1}`,
          verifiedBy: 'USR-PS-001',
          role: 'Project Supervisor',
          action: 'Approved',
          status: SubmissionStatus.APPROVED,
          comment: 'Verified against supporting project records.',
          timestamp: submission.updatedAt ?? submission.createdAt ?? new Date().toISOString(),
        });
      }

      return {
        submissionId: submission.submissionId ?? submission.id ?? `SUB-DEMO-${index + 1}`,
        meilId: 'MEIL',
        subsidiaryId: submission.subsidiaryId,
        businessUnitId: submission.businessUnitId,
        projectId: submission.projectId,
        userId,
        parameterId: submission.parameterId,
        scope: parameter?.scope ?? Scope.SECTION_C,
        dataEntryDate: (submission.submittedAt ?? submission.createdAt ?? new Date().toISOString()).slice(0, 10),
        reportingPeriod: submission.reportingPeriod ?? 'FY 2025-26',
        activityValue,
        activityUnit: submission.unit ?? parameter?.unit ?? 'Units',
        emissionFactorId: submission.emissionFactorId,
        calculation: submission.emissionFactorValue === undefined ? undefined : {
          calculationId: `CAL-DEMO-${index + 1}`,
          activityValue,
          activityUnit: submission.unit ?? parameter?.unit ?? 'Units',
          emissionFactorId: submission.emissionFactorId ?? '',
          emissionFactorValue: submission.emissionFactorValue,
          emissionFactorUnit: `kgCO₂e/${submission.unit ?? parameter?.unit ?? 'unit'}`,
          rawKgCO2e: submission.calculatedCO2e ? submission.calculatedCO2e * 1000 : 0,
          convertedTonnesCO2e: submission.calculatedCO2e ?? 0,
          formula: 'Activity Data × Emission Factor ÷ 1,000',
          calculatedAt: submission.updatedAt ?? new Date().toISOString(),
        },
        remarks: submission.notes ?? '',
        status: currentStatus,
        evidenceIds: submission.evidenceIds ?? [],
        submittedAt: submission.submittedAt,
        createdAt: submission.createdAt ?? new Date().toISOString(),
        updatedAt: submission.updatedAt ?? new Date().toISOString(),
        supervisorNotes: currentStatus === SubmissionStatus.CORRECTION_REQUIRED
          ? submission.supervisorNotes ?? 'Please reconcile the reported activity data with the attached source evidence.'
          : submission.supervisorNotes,
        verifiedBy: submission.verifiedBy,
        verificationHistory,
        correctionHistory: [],
      };
    });
}

export function getUserSubmissions(userId: string, projectId: string): ProjectUserSubmission[] {
  const stored = readStoredValue<ProjectUserSubmission[] | null>(PROJECT_USER_STORAGE_KEYS.submissions, null);
  const current = stored ?? [];
  const demoSeeds = users.filter(user => user.role === UserRole.PROJECT_USER && ['PRJ001', 'PRJ002'].includes(user.projectId ?? '')).flatMap(user => {
    const userRecords = mockSubmissions.filter(submission => submission.userId === user.id && submission.projectId === user.projectId);
    const seededBase = userRecords.length ? userRecords : seedUserSubmissions(user.id, user.projectId!);
    return seededBase.map((submission, index) => {
      const parameter = getParameterById(submission.parameterId);
      const activityValue = submission.activityData ?? submission.value ?? 0;
      const now = submission.submittedAt ?? submission.createdAt ?? new Date().toISOString();
      const calculated = submission.emissionFactorValue === undefined ? undefined : {
        calculationId: `DEMO-CAL-${submission.submissionId ?? index}`,
        activityValue,
        activityUnit: submission.unit ?? parameter?.unit ?? 'Units',
        emissionFactorId: submission.emissionFactorId ?? '',
        emissionFactorValue: submission.emissionFactorValue,
        emissionFactorUnit: parameter?.unit ?? 'unit',
        emissionFactorSource: 'Demo factor database',
        rawKgCO2e: (submission.calculatedCO2e ?? 0) * 1000,
        convertedTonnesCO2e: submission.calculatedCO2e ?? 0,
        formula: 'Activity value × emission factor ÷ 1,000',
        calculatedAt: now,
      };
      return {
        submissionId: submission.submissionId ?? submission.id ?? `DEMO-${user.id}-${index + 1}`,
        meilId: 'MEIL', subsidiaryId: submission.subsidiaryId, businessUnitId: submission.businessUnitId,
        projectId: submission.projectId, userId: user.id, parameterId: submission.parameterId,
        scope: submission.scope ?? parameter?.scope ?? Scope.SECTION_C,
        dataEntryDate: now.slice(0, 10), reportingPeriod: submission.reportingPeriod ?? 'FY 2025-26',
        activityValue, activityUnit: submission.unit ?? parameter?.unit ?? 'Units',
        emissionFactorId: submission.emissionFactorId, calculation: calculated, remarks: submission.notes ?? '',
        status: submission.status, evidenceIds: submission.evidenceIds ?? [], createdAt: submission.createdAt ?? now,
        updatedAt: submission.updatedAt ?? now, submittedAt: submission.submittedAt,
        supervisorNotes: submission.supervisorNotes, verificationHistory: [], correctionHistory: [],
      } satisfies ProjectUserSubmission;
    });
  });
  const missingDemoSeeds = demoSeeds.filter(seed => !current.some(submission => submission.submissionId === seed.submissionId));
  const merged = [...current, ...missingDemoSeeds];
  if (stored === null || missingDemoSeeds.length) writeStoredValue(PROJECT_USER_STORAGE_KEYS.submissions, merged);
  return merged.filter(submission => submission.userId === userId && submission.projectId === projectId);
}

export function getSubmissionById(userId: string, submissionId: string): ProjectUserSubmission | undefined {
  return readStoredValue<ProjectUserSubmission[]>(PROJECT_USER_STORAGE_KEYS.submissions, [])
    .find(submission => submission.userId === userId && submission.submissionId === submissionId);
}

export function saveSubmission(submission: ProjectUserSubmission): ProjectUserSubmission {
  const allSubmissions = readStoredValue<ProjectUserSubmission[]>(PROJECT_USER_STORAGE_KEYS.submissions, []);
  const index = allSubmissions.findIndex(item => item.submissionId === submission.submissionId && item.userId === submission.userId);
  if (index !== -1) {
    const previousStatus = allSubmissions[index].status;
    const allowedNextStatuses: Partial<Record<SubmissionStatus, SubmissionStatus[]>> = {
      [SubmissionStatus.DRAFT]: [SubmissionStatus.DRAFT, SubmissionStatus.SUBMITTED],
      [SubmissionStatus.SUBMITTED]: [SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW, SubmissionStatus.CORRECTION_REQUIRED, SubmissionStatus.CORRECTION_REQUESTED, SubmissionStatus.REJECTED, SubmissionStatus.APPROVED, SubmissionStatus.VERIFIED_LEVEL_1],
      [SubmissionStatus.UNDER_REVIEW]: [SubmissionStatus.UNDER_REVIEW, SubmissionStatus.CORRECTION_REQUIRED, SubmissionStatus.CORRECTION_REQUESTED, SubmissionStatus.REJECTED, SubmissionStatus.APPROVED, SubmissionStatus.VERIFIED_LEVEL_1],
      [SubmissionStatus.CORRECTION_REQUIRED]: [SubmissionStatus.UNDER_REVIEW],
      [SubmissionStatus.CORRECTION_REQUESTED]: [SubmissionStatus.UNDER_REVIEW],
    };
    if (!allowedNextStatuses[previousStatus]?.includes(submission.status)) {
      throw new Error(`A ${previousStatus.replaceAll('_', ' ')} submission cannot be edited or moved to ${submission.status.replaceAll('_', ' ')}.`);
    }
  }
  const updated = { ...submission, updatedAt: new Date().toISOString() };
  if (index === -1) allSubmissions.unshift(updated);
  else allSubmissions[index] = updated;
  writeStoredValue(PROJECT_USER_STORAGE_KEYS.submissions, allSubmissions);
  return updated;
}

export function deleteDraft(userId: string, submissionId: string): void {
  const allSubmissions = readStoredValue<ProjectUserSubmission[]>(PROJECT_USER_STORAGE_KEYS.submissions, []);
  const submission = allSubmissions.find(item => item.userId === userId && item.submissionId === submissionId);
  if (!submission || submission.status !== SubmissionStatus.DRAFT) {
    throw new Error('Only your draft submissions can be deleted.');
  }
  writeStoredValue(PROJECT_USER_STORAGE_KEYS.submissions, allSubmissions.filter(item => item !== submission));
}

export function createSubmissionId(): string {
  const existing = readStoredValue<ProjectUserSubmission[]>(PROJECT_USER_STORAGE_KEYS.submissions, []);
  const highest = existing.reduce((max, submission) => {
    const value = Number(submission.submissionId.match(/\d+$/)?.[0] ?? 0);
    return Math.max(max, value);
  }, 0);
  return `SUB-${String(highest + 1).padStart(6, '0')}`;
}

export function createProjectUserSubmission(input: {
  userId: string;
  projectId: string;
  businessUnitId: string;
  subsidiaryId: string;
  parameterId: string;
  scope: Scope;
  dataEntryDate: string;
  reportingPeriod: string;
  activityValue: number;
  activityUnit: string;
  emissionFactorId?: string;
  calculation?: ProjectUserCalculation;
  remarks: string;
  evidenceIds: string[];
  status: SubmissionStatus;
  submissionId?: string;
}): ProjectUserSubmission {
  const now = new Date().toISOString();
  return {
    ...input,
    meilId: 'MEIL',
    submissionId: input.submissionId ?? createSubmissionId(),
    createdAt: now,
    updatedAt: now,
    submittedAt: input.status === SubmissionStatus.DRAFT ? undefined : now,
    verificationHistory: input.status === SubmissionStatus.DRAFT ? [] : [{
      verificationId: `VER-${crypto.randomUUID()}`,
      verifiedBy: input.userId,
      role: 'Project Data User',
      action: input.status === SubmissionStatus.SUBMITTED ? 'Submitted' : 'Resubmitted',
      status: input.status,
      comment: 'Submitted for Project Supervisor verification.',
      timestamp: now,
    }],
    correctionHistory: [],
  };
}

export function getSubmissionCountForStatus(userId: string, projectId: string, status: SubmissionStatus): number {
  return getUserSubmissions(userId, projectId).filter(submission => submission.status === status).length;
}
