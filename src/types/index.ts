// ============================================================
// MEIL ESG & BRSR Reporting Platform — Type Definitions
// ============================================================

// ---------- Enums ----------

export enum UserRole {
  PROJECT_USER = 'PROJECT_USER',
  PROJECT_SUPERVISOR = 'PROJECT_SUPERVISOR',
  BU_SUPERVISOR = 'BU_SUPERVISOR',
  SUBSIDIARY_SUPERVISOR = 'SUBSIDIARY_SUPERVISOR',
  MEIL_ADMIN = 'MEIL_ADMIN',
}

export enum SubmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CORRECTION_REQUIRED = 'CORRECTION_REQUIRED',
  CORRECTION_REQUESTED = 'CORRECTION_REQUESTED',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  VERIFIED_LEVEL_1 = 'VERIFIED_LEVEL_1',
  VERIFIED_LEVEL_2 = 'VERIFIED_LEVEL_2',
  VERIFIED_LEVEL_3 = 'VERIFIED_LEVEL_3',
  CONSOLIDATED = 'CONSOLIDATED',
  CONSOLIDATED_PROJECT = 'CONSOLIDATED_PROJECT',
  FORWARDED = 'FORWARDED',
  SEALED = 'SEALED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
  RESUBMITTED = 'RESUBMITTED',
}

export enum Scope {
  SCOPE_1 = 'SCOPE_1',
  SCOPE_2 = 'SCOPE_2',
  SCOPE_3 = 'SCOPE_3',
  SECTION_C = 'SECTION_C',
  OTHER_ENVIRONMENTAL = 'OTHER_ENVIRONMENTAL',
}

export enum VerificationAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REQUEST_CORRECTION = 'REQUEST_CORRECTION',
}

// ---------- Organization Hierarchy ----------

export interface Organization {
  id: string;
  name: string;
  code: string;
}

export interface Subsidiary {
  id: string;
  name: string;
  code: string;
  meilId?: string;
  supervisorId?: string;
  businessUnitIds?: string[];
  sector?: string;
  turnover?: number;
}

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  subsidiaryId: string;
  supervisorId?: string;
  projectIds?: string[];
}

export interface Project {
  id: string;
  name: string;
  code: string;
  businessUnitId: string;
  subsidiaryId: string;
  supervisorId?: string;
  userIds?: string[];
  status?: SubmissionStatus;
  reportingPeriod?: string;
  location?: string;
  budget?: number;
}

// ---------- Users ----------

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  projectId?: string;
  businessUnitId?: string;
  subsidiaryId?: string;
  assignedProjectIds?: string[];
  assignedBUIds?: string[];
  assignedSubsidiaryIds?: string[];
}

// ---------- ESG Parameters ----------

export interface ESGParameter {
  id?: string;
  parameterId?: string;
  name: string;
  code: string;
  scope: Scope;
  category: string;
  unit: string;
  description?: string;
  requiresEvidence?: boolean;
  emissionFactorId?: string;
  brsrPrinciple?: string;
  type?: string;
}

// ---------- Emission Factors ----------

export interface EmissionFactor {
  id?: string;
  factorId?: string;
  parameterId?: string;
  factor?: number;
  factorValue?: number;
  unit: string;
  scope?: Scope;
  source?: string;
  sourceVersion?: string;
  year?: string;
  reportingYear?: string;
  geography?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  methodology?: string;
  status?: 'ACTIVE' | 'DEMO' | 'ARCHIVED';
  isDemo?: boolean;
}

// ---------- Submissions ----------

export interface ParameterSubmission {
  id?: string;
  submissionId?: string;
  parameterId: string;
  projectId: string;
  businessUnitId: string;
  subsidiaryId: string;
  userId?: string;
  submittedBy?: string;
  value?: number;
  activityData?: number;
  unit?: string;
  scope?: Scope;
  period?: string;
  emissionFactorId?: string;
  emissionFactorValue?: number;
  calculatedCO2e?: number;
  co2eUnit?: string;
  reportingPeriod?: string;
  source?: string;
  notes?: string;
  supervisorNotes?: string;
  status: SubmissionStatus;
  evidenceIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

// ---------- Evidence ----------

export interface Evidence {
  evidenceId: string;
  originalFilename: string;
  systemFilename: string;
  fileExtension?: string;
  fileType?: string;
  fileSize: number;
  fileHash?: string;
  meilId?: string;
  subsidiaryId: string;
  businessUnitId: string;
  projectId: string;
  userId?: string;
  parameterId: string;
  submissionId: string;
  uploadedBy?: string;
  uploadedAt: string;
  verificationStatus?: SubmissionStatus;
  verificationHistory?: VerificationRecord[];
  sequenceNumber?: number;
}

// ---------- Verification ----------

export interface VerificationRecord {
  id: string;
  action: VerificationAction | string;
  performedBy: string;
  performedByRole: UserRole;
  performedAt: string;
  previousStatus: SubmissionStatus;
  newStatus: SubmissionStatus;
  comment: string;
}

// ---------- Consolidation ----------

export interface ConsolidationRecord {
  id: string;
  level: 'PROJECT' | 'BUSINESS_UNIT' | 'SUBSIDIARY' | 'MEIL' | string;
  entityId: string;
  entityName: string;
  parentEntityId?: string;
  childRecordIds?: string[];
  period?: string;
  reportingPeriod?: string;
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  sectionCData?: Record<string, number>;
  totalCO2e: number;
  status: SubmissionStatus | string;
  consolidatedBy: string;
  consolidatedAt: string;
  submissionCount?: number;
  verificationHistory?: VerificationRecord[];
}

// ---------- Audit Trail ----------

export interface AuditEvent {
  id: string;
  user?: string;
  userId: string;
  role?: UserRole;
  action: string;
  entity?: string;
  entityType?: string;
  entityId: string;
  timestamp: string;
  previousStatus?: SubmissionStatus;
  newStatus?: SubmissionStatus;
  comment?: string;
  details?: string;
}

// ---------- Notifications ----------

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | string;
  read: boolean;
  createdAt: string;
  link?: string;
  entityType?: string;
  entityId?: string;
}

// ---------- Report ----------

export interface BRSRReport {
  id: string;
  reportingYear: string;
  asOfDate: string;
  generatedBy: string;
  generatedAt: string;
  status: 'DRAFT' | 'GENERATED' | 'FINALIZED';
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  totalCO2e: number;
  subsidiaryBreakdown: ConsolidationRecord[];
  methodology: string;
}

// ---------- Auth Context ----------

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  register: (user: Partial<User>) => boolean;
}

// ---------- Dashboard KPI ----------

export interface DashboardKPI {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: string;
  color?: string;
}
