import { businessUnits as seedUnits, consolidationRecords as seedConsolidations, esgParameters, parameterSubmissions, projects as seedProjects, subsidiaries as seedSubsidiaries } from '../data/mockData';
import { BusinessUnit, ConsolidationRecord, Evidence, ParameterSubmission, Project, Scope, SubmissionStatus, Subsidiary } from '../types';
import { ProjectUserEvidence, ProjectUserSubmission } from '../types/projectUser';
import { MEIL_STORAGE_KEYS, readStoredValue, writeStoredValue } from './localStorageService';

export const ADMIN_DEMO_TAG = 'MEIL_JUDGE_DEMO';
export const ADMIN_DEMO_PERIOD = 'FY 2025-26';
const filesKey = MEIL_STORAGE_KEYS.evidence;

export interface AdminDemoResult { subsidiaries: number; businessUnits: number; projects: number; parameters: number; files: number; }
export interface DemoParameterInspection { parameterId: string; name: string; scope: Scope; unit: string; entries: ProjectUserSubmission[]; files: Array<Evidence | ProjectUserEvidence>; }

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return items.filter((item, index, all) => all.findIndex(other => other.id === item.id) === index);
}

export function createAdminDemoData(): AdminDemoResult {
  const timestamp = new Date().toISOString();
  const subsidiary: Subsidiary = {
    id: 'SUB-JUDGE-01', name: 'MEIL Judge Demo Infrastructure', code: 'SUB-JUDGE-01', meilId: 'MEIL',
    supervisorId: 'USR-SUB-JUDGE-01', businessUnitIds: ['BU-JUDGE-01', 'BU-JUDGE-02'],
    sector: 'Infrastructure & Energy', turnover: 1850,
  };
  const subsidiaries = uniqueById([...seedSubsidiaries, ...readStoredValue<Subsidiary[]>('meil_subsidiaries', []), subsidiary]);
  const demoUnits: BusinessUnit[] = [
    { id: 'BU-JUDGE-01', name: 'Infrastructure Delivery', code: 'BU-JUDGE-01', subsidiaryId: subsidiary.id, supervisorId: 'USR-BU-JUDGE-01', projectIds: ['PRJ-JUDGE-01'] },
    { id: 'BU-JUDGE-02', name: 'Clean Energy Projects', code: 'BU-JUDGE-02', subsidiaryId: subsidiary.id, supervisorId: 'USR-BU-JUDGE-02', projectIds: ['PRJ-JUDGE-02'] },
  ];
  const businessUnits = uniqueById([...seedUnits, ...readStoredValue<BusinessUnit[]>('meil_business_units', []), ...demoUnits]);
  const storedProjects = readStoredValue<Record<string, Project>>('meil_projects', {});
  const demoProjects: Project[] = [
    { id: 'PRJ-JUDGE-01', name: 'Central Infrastructure Corridor', code: 'PRJ-JUDGE-01', businessUnitId: 'BU-JUDGE-01', subsidiaryId: subsidiary.id, supervisorId: 'USR-PS-JUDGE-01', userIds: ['USR-JUDGE-01A', 'USR-JUDGE-01B'], status: SubmissionStatus.VERIFIED_LEVEL_3, reportingPeriod: ADMIN_DEMO_PERIOD, location: 'Hyderabad, Telangana' },
    { id: 'PRJ-JUDGE-02', name: 'Solar and Storage Expansion', code: 'PRJ-JUDGE-02', businessUnitId: 'BU-JUDGE-02', subsidiaryId: subsidiary.id, supervisorId: 'USR-PS-JUDGE-02', userIds: ['USR-JUDGE-02A', 'USR-JUDGE-02B'], status: SubmissionStatus.VERIFIED_LEVEL_3, reportingPeriod: ADMIN_DEMO_PERIOD, location: 'Kurnool, Andhra Pradesh' },
  ];
  const projects = uniqueById([...seedProjects.map(project => storedProjects[project.id] || project), ...Object.values(storedProjects), ...demoProjects]);

  const generatedSubmissions: ProjectUserSubmission[] = [];
  const generatedLegacy: ParameterSubmission[] = [];
  const generatedFiles: ProjectUserEvidence[] = [];
  const projectBatches: ConsolidationRecord[] = [];
  const buBatches: ConsolidationRecord[] = [];
  const fileType = 'text/csv;charset=utf-8';

  for (const [projectIndex, project] of demoProjects.entries()) {
    const unit = demoUnits.find(item => item.id === project.businessUnitId)!;
    const scopeTotals: Record<string, number> = { [Scope.SCOPE_1]: 0, [Scope.SCOPE_2]: 0, [Scope.SCOPE_3]: 0 };
    const sectionCData: Record<string, number> = {};
    const childIds: string[] = [];
    for (const [parameterIndex, parameter] of esgParameters.entries()) {
      const submitter = project.userIds![parameterIndex % project.userIds!.length];
      const id = `${ADMIN_DEMO_TAG}-${project.id}-${parameter.code}`;
      const value = Number((120 + ((parameterIndex + 1) * (projectIndex ? 73 : 51)) + (parameterIndex % 4) * 19).toFixed(2));
      const factor = parameter.scope === Scope.SCOPE_1 ? 2.68 : parameter.scope === Scope.SCOPE_2 ? 0.82 : parameter.scope === Scope.SCOPE_3 ? 0.35 : undefined;
      const tonnes = factor ? Number((value * factor / 1000).toFixed(4)) : 0;
      const fileId = `${ADMIN_DEMO_TAG}-FILE-${project.id}-${parameter.code}`;
      const filename = `${parameter.code.toLowerCase()}_${project.id.toLowerCase()}_supporting-evidence.csv`;
      const systemFilename = `MEIL_${subsidiary.id}_${unit.id}_${project.id}_${submitter}_${parameter.code}_20261009_${String(parameterIndex + 1).padStart(2, '0')}.csv`;
      const text = [
        'MEIL ESG demonstration evidence', `Parameter,${parameter.name}`, `Scope,${parameter.scope}`,
        `Project,${project.name}`, `Reported activity,${value} ${parameter.unit}`, `Reporting period,${ADMIN_DEMO_PERIOD}`,
        `Verification,Verified sample data`,
      ].join('\n');
      const submission: ProjectUserSubmission = {
        submissionId: id, meilId: 'MEIL', subsidiaryId: subsidiary.id, businessUnitId: unit.id, projectId: project.id,
        userId: submitter, parameterId: parameter.parameterId || parameter.code, scope: parameter.scope,
        dataEntryDate: '2026-10-08', reportingPeriod: ADMIN_DEMO_PERIOD, activityValue: value, activityUnit: parameter.unit,
        emissionFactorId: parameter.emissionFactorId,
        ...(factor ? { calculation: { calculationId: `CALC-${id}`, submissionId: id, activityValue: value, activityUnit: parameter.unit, emissionFactorId: parameter.emissionFactorId || '', emissionFactorValue: factor, emissionFactorUnit: `kgCO2e/${parameter.unit}`, emissionFactorSource: 'Demonstration reporting factor', rawKgCO2e: tonnes * 1000, convertedTonnesCO2e: tonnes, formula: 'activity data × emission factor ÷ 1,000', calculatedAt: timestamp } } : {}),
        remarks: `Verified demonstration submission for ${parameter.name}.`, status: SubmissionStatus.VERIFIED_LEVEL_3,
        evidenceIds: [fileId], submittedAt: timestamp, createdAt: timestamp, updatedAt: timestamp, verifiedBy: subsidiary.supervisorId,
        verificationHistory: [{ verificationId: `VER-${id}`, verifiedBy: subsidiary.supervisorId!, role: 'Subsidiary Supervisor', action: 'Verified at Level 3', status: SubmissionStatus.VERIFIED_LEVEL_3, comment: 'Demo record is verified and ready for consolidated inspection.', timestamp }], correctionHistory: [],
      };
      generatedSubmissions.push(submission);
      childIds.push(id);
      generatedLegacy.push({ id, submissionId: id, parameterId: parameter.parameterId || parameter.code, projectId: project.id, businessUnitId: unit.id, subsidiaryId: subsidiary.id, userId: submitter, submittedBy: submitter, value, activityData: value, unit: parameter.unit, scope: parameter.scope, period: '202610', reportingPeriod: ADMIN_DEMO_PERIOD, emissionFactorId: parameter.emissionFactorId, emissionFactorValue: factor, calculatedCO2e: tonnes, co2eUnit: 'tCO2e', source: filename, notes: submission.remarks, status: SubmissionStatus.VERIFIED_LEVEL_3, evidenceIds: [fileId], createdAt: timestamp, updatedAt: timestamp, submittedAt: timestamp, verifiedBy: subsidiary.supervisorId, verifiedAt: timestamp });
      generatedFiles.push({ evidenceId: fileId, originalFilename: filename, systemFilename, fileExtension: 'csv', fileType, fileSize: new Blob([text]).size, meilId: 'MEIL', subsidiaryId: subsidiary.id, businessUnitId: unit.id, projectId: project.id, userId: submitter, parameterId: parameter.parameterId || parameter.code, submissionId: id, uploadedBy: submitter, uploadedAt: timestamp, verificationStatus: SubmissionStatus.VERIFIED_LEVEL_3, dataUrl: `data:${fileType},${encodeURIComponent(text)}` });
      if (factor) scopeTotals[parameter.scope] += tonnes;
      else sectionCData[parameter.parameterId || parameter.code] = value;
    }
    const projectBatch: ConsolidationRecord = {
      id: `CON-${project.id}`, level: 'PROJECT', entityId: project.id, entityName: project.name, parentEntityId: unit.id,
      childRecordIds: childIds, period: ADMIN_DEMO_PERIOD, reportingPeriod: ADMIN_DEMO_PERIOD,
      scope1Total: scopeTotals[Scope.SCOPE_1], scope2Total: scopeTotals[Scope.SCOPE_2], scope3Total: scopeTotals[Scope.SCOPE_3],
      sectionCData, totalCO2e: scopeTotals[Scope.SCOPE_1] + scopeTotals[Scope.SCOPE_2] + scopeTotals[Scope.SCOPE_3],
      status: SubmissionStatus.VERIFIED_LEVEL_2, consolidatedBy: project.supervisorId || '', consolidatedAt: timestamp, submissionCount: esgParameters.length,
    };
    projectBatches.push(projectBatch);
    buBatches.push({ ...projectBatch, id: `CON-${unit.id}`, level: 'BUSINESS_UNIT', entityId: unit.id, entityName: unit.name, parentEntityId: subsidiary.id, childRecordIds: [projectBatch.id], status: SubmissionStatus.VERIFIED_LEVEL_3, consolidatedBy: unit.supervisorId || '' });
  }

  const subBatch: ConsolidationRecord = {
    id: `CON-${subsidiary.id}`, level: 'SUBSIDIARY', entityId: subsidiary.id, entityName: subsidiary.name, parentEntityId: 'MEIL',
    childRecordIds: buBatches.map(batch => batch.id), period: ADMIN_DEMO_PERIOD, reportingPeriod: ADMIN_DEMO_PERIOD,
    scope1Total: buBatches.reduce((sum, batch) => sum + batch.scope1Total, 0),
    scope2Total: buBatches.reduce((sum, batch) => sum + batch.scope2Total, 0),
    scope3Total: buBatches.reduce((sum, batch) => sum + batch.scope3Total, 0),
    sectionCData: Object.assign({}, ...buBatches.map(batch => batch.sectionCData || {})),
    totalCO2e: buBatches.reduce((sum, batch) => sum + batch.totalCO2e, 0), status: SubmissionStatus.VERIFIED_LEVEL_3,
    consolidatedBy: subsidiary.supervisorId || '', consolidatedAt: timestamp, submissionCount: generatedSubmissions.length,
  };

  const storedUserSubs = readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions, []).filter(item => !item.submissionId.startsWith(`${ADMIN_DEMO_TAG}-`));
  const storedLegacy = readStoredValue<ParameterSubmission[]>('meil_supervisor_submissions', parameterSubmissions).filter(item => !String(item.id || item.submissionId).startsWith(`${ADMIN_DEMO_TAG}-`));
  const storedEvidence = readStoredValue<ProjectUserEvidence[]>(filesKey, []).filter(item => !item.evidenceId.startsWith(`${ADMIN_DEMO_TAG}-`));
  const persist = <T,>(key: string, items: T[]) => writeStoredValue(key, items);
  persist('meil_subsidiaries', subsidiaries);
  persist('meil_business_units', businessUnits);
  writeStoredValue('meil_projects', Object.fromEntries(projects.map(project => [project.id, project])));
  persist(MEIL_STORAGE_KEYS.submissions, [...storedUserSubs, ...generatedSubmissions]);
  persist('meil_supervisor_submissions', [...storedLegacy, ...generatedLegacy]);
  persist(filesKey, [...storedEvidence, ...generatedFiles]);
  persist('meil_project_consolidations', [...seedConsolidations.filter(record => record.level === 'PROJECT'), ...projectBatches]);
  persist('meil_bu_consolidations', [...seedConsolidations.filter(record => record.level === 'BUSINESS_UNIT'), ...buBatches]);
  persist('meil_subsidiary_incoming_batches', [...seedConsolidations.filter(record => record.level === 'BUSINESS_UNIT' && record.parentEntityId !== 'SUB001'), ...buBatches]);
  persist('meil_admin_demo_subsidiary_batches', [subBatch]);
  writeStoredValue('meil_demo_data_generated', { tag: ADMIN_DEMO_TAG, generatedAt: timestamp, reportingPeriod: ADMIN_DEMO_PERIOD });
  return { subsidiaries: 1, businessUnits: demoUnits.length, projects: demoProjects.length, parameters: generatedSubmissions.length, files: generatedFiles.length };
}

export function getAdminConsolidationRecords(): ConsolidationRecord[] {
  const stored = readStoredValue<ConsolidationRecord[]>('meil_consolidations', []);
  const demoSubs = readStoredValue<ConsolidationRecord[]>('meil_admin_demo_subsidiary_batches', []);
  return uniqueById([...seedConsolidations, ...stored, ...demoSubs]);
}

export function getAdminEvidence(): Array<Evidence | ProjectUserEvidence> {
  return readStoredValue<ProjectUserEvidence[]>(filesKey, []);
}

export function getDemoParameterInspection(subsidiaryId: string): DemoParameterInspection[] {
  const submissions = readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions, []).filter(item => item.subsidiaryId === subsidiaryId);
  const evidence = getAdminEvidence().filter(item => item.subsidiaryId === subsidiaryId);
  return esgParameters.map(parameter => {
    const parameterId = parameter.parameterId || parameter.code;
    const entries = submissions.filter(item => item.parameterId === parameterId);
    const entryIds = new Set(entries.map(item => item.submissionId));
    return { parameterId, name: parameter.name, scope: parameter.scope, unit: parameter.unit, entries, files: evidence.filter(file => entryIds.has(file.submissionId)) };
  }).filter(parameter => parameter.entries.length > 0);
}

export function getVerifiedSubsidiaryBatches(period?: string): ConsolidationRecord[] {
  return getAdminConsolidationRecords().filter(record => record.level === 'SUBSIDIARY' && record.status === SubmissionStatus.VERIFIED_LEVEL_3 && (!period || (record.reportingPeriod || record.period) === period));
}
