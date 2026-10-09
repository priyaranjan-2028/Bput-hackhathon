import { Scope, SubmissionStatus, UserRole } from './index';

export interface ProjectUserDataModelUser {
  userId: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  projectId: string;
  businessUnitId: string;
  subsidiaryId: string;
}

export interface ProjectUserDataModelParameter {
  parameterId: string;
  name: string;
  section: string;
  scope: Scope;
  description: string;
  dataType: string;
  unit: string;
  evidenceRequired: boolean;
  calculationRequired: boolean;
  emissionFactorId?: string;
  status?: string;
}

export interface ProjectUserDataModelParameterAssignment {
  assignmentId: string;
  parameterId: string;
  projectId: string;
  userId: string;
  assignedBy: string;
  assignedAt: string;
  status: string;
}

export interface ProjectUserDataModelSubmission {
  submissionId: string;
  projectId: string;
  userId: string;
  parameterId: string;
  reportingPeriod: string;
  dataEntryDate: string;
  activityValue: number;
  unit: string;
  remarks: string;
  calculatedCO2e?: number;
  status: SubmissionStatus;
  submittedAt?: string;
}

export interface ProjectUserDataModelEvidence {
  evidenceId: string;
  originalFilename: string;
  systemFilename: string;
  fileExtension: string;
  fileType: string;
  fileSize: number;
  projectId: string;
  userId: string;
  parameterId: string;
  submissionId?: string;
  uploadedBy: string;
  uploadedAt: string;
  verificationStatus: SubmissionStatus;
}

export interface ProjectUserDataModelCalculation {
  calculationId: string;
  submissionId?: string;
  activityValue: number;
  activityUnit: string;
  emissionFactor: number;
  emissionFactorUnit: string;
  emissionFactorSource?: string;
  rawKgCO2e: number;
  totalTCO2e: number;
  calculatedAt: string;
}

export interface ProjectUserDataModelVerification {
  verificationId: string;
  submissionId: string;
  status: SubmissionStatus;
  verifiedBy: string;
  verifiedAt: string;
  comment: string;
}

export interface ProjectUserCalculation {
  calculationId: string;
  submissionId?: string;
  activityValue: number;
  activityUnit: string;
  emissionFactorId: string;
  emissionFactorValue: number;
  emissionFactorUnit: string;
  emissionFactorSource?: string;
  rawKgCO2e: number;
  convertedTonnesCO2e: number;
  formula: string;
  calculatedAt: string;
}

export interface ProjectUserSubmission {
  submissionId: string;
  meilId: string;
  subsidiaryId: string;
  businessUnitId: string;
  projectId: string;
  userId: string;
  parameterId: string;
  scope: Scope;
  dataEntryDate: string;
  reportingPeriod: string;
  activityValue: number;
  activityUnit: string;
  emissionFactorId?: string;
  calculation?: ProjectUserCalculation;
  remarks: string;
  status: SubmissionStatus;
  evidenceIds: string[];
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  supervisorNotes?: string;
  verifiedBy?: string;
  verificationHistory: ProjectUserVerification[];
  correctionHistory: ProjectUserCorrection[];
}

export interface ProjectUserVerification {
  verificationId: string;
  submissionId?: string;
  verifiedBy: string;
  role: string;
  action: string;
  status: SubmissionStatus;
  comment: string;
  timestamp: string;
}

export interface ProjectUserCorrection {
  correctionId: string;
  activityValue: number;
  remarks: string;
  evidenceIds: string[];
  correctedAt: string;
}

export interface ProjectUserEvidence {
  evidenceId: string;
  originalFilename: string;
  systemFilename: string;
  fileExtension: string;
  fileType: string;
  fileSize: number;
  meilId: string;
  subsidiaryId: string;
  businessUnitId: string;
  projectId: string;
  userId: string;
  parameterId: string;
  submissionId?: string;
  uploadedBy?: string;
  uploadedAt: string;
  verificationStatus: SubmissionStatus;
  verificationHistory?: ProjectUserVerification[];
  dataUrl?: string;
}

export interface ProjectUserNotification {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  submissionId?: string;
  parameterId?: string;
  link?: string;
}
