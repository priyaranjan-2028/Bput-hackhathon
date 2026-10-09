import { businessUnits, emissionFactors, esgParameters, parameterSubmissions, projects as seedProjects } from '../data/mockData';
import { Scope, SubmissionStatus } from '../types';
import { ProjectUserEvidence, ProjectUserSubmission } from '../types/projectUser';
import { MEIL_STORAGE_KEYS, readStoredValue, writeStoredValue } from './localStorageService';
import { createProjectUser, getProjectUsers } from './projectSupervisorService';
import { getBusinessUnitProjects } from './businessUnitService';

const ascii = (value: string) => value.normalize('NFKD').replace(/[^\x20-\x7E]/g, '?').replace(/[()\\]/g, '\\$&');

function makeDemoPdf(lines: string[]): string {
  const content = ['BT', '/F1 12 Tf', '50 750 Td', ...lines.flatMap((line, index) => [index ? '0 -18 Td' : '', `(${ascii(line)}) Tj`]).filter(Boolean), 'ET'].join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
  ];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach(object => { offsets.push(pdf.length); pdf += `${object}\n`; });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return `data:application/pdf;base64,${btoa(pdf)}`;
}

export function ensureDemoProjectData(projectId: string): { users: number; submissions: number; files: number; seeded: boolean } {
  const project = businessUnits.map(unit => getBusinessUnitProjects(unit.id)).flat().find(item => item.id === projectId)
    || seedProjects.find(item => item.id === projectId);
  if (!project) throw new Error('Could not load the assigned project.');
  const seededProjects = readStoredValue<string[]>('meil_demo_seeded_projects', []);
  if (seededProjects.includes(projectId)) {
    const existing = readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions, []).filter(item => item.projectId === projectId);
    return { users: getProjectUsers(projectId).length, submissions: existing.length, files: readStoredValue<ProjectUserEvidence[]>(MEIL_STORAGE_KEYS.evidence, []).filter(item => item.projectId === projectId).length, seeded: false };
  }

  let projectUsers = getProjectUsers(projectId);
  while (projectUsers.length < 3) {
    const index = projectUsers.length + 1;
    projectUsers = [...projectUsers, createProjectUser({ name: `Demo Data User ${index}`, email: `demo.${projectId.toLowerCase()}.${index}@demo.com` }, projectId)];
  }
  projectUsers = projectUsers.slice(0, 3);
  const existingSubmissions = readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions, []);
  const existingEvidence = readStoredValue<ProjectUserEvidence[]>(MEIL_STORAGE_KEYS.evidence, []);
  const demoParameters = esgParameters.filter(parameter => [Scope.SCOPE_1, Scope.SCOPE_2, Scope.SCOPE_3, Scope.SECTION_C, Scope.OTHER_ENVIRONMENTAL].includes(parameter.scope));
  const now = new Date(); const date = now.toISOString().slice(0, 10); const period = project.reportingPeriod || 'FY 2025-26';
  const createdSubmissions: ProjectUserSubmission[] = []; const createdEvidence: ProjectUserEvidence[] = [];

  projectUsers.forEach((person, userIndex) => demoParameters.forEach((parameter, parameterIndex) => {
    const submissionId = `DEMO-${projectId}-${person.id}-${parameter.code}`;
    if (existingSubmissions.some(item => item.submissionId === submissionId)) return;
    const activityValue = Math.round(120 + (userIndex + 1) * 175 + (parameterIndex + 2) * 83);
    const factor = emissionFactors.find(item => item.factorId === parameter.emissionFactorId || item.parameterId === parameter.parameterId);
    const evidenceId = `DEMO-EVID-${projectId}-${person.id}-${parameter.code}`;
    const fileName = `demo_${parameter.code.toLowerCase()}_${person.id.toLowerCase()}.pdf`;
    const dataUrl = makeDemoPdf([
      'MEIL ESG/BRSR DEMONSTRATION EVIDENCE',
      `Project: ${project.name} (${project.code})`,
      `Project user: ${person.name} (${person.email})`,
      `Parameter: ${parameter.name} (${parameter.code})`,
      `Scope/category: ${parameter.scope} / ${parameter.category}`,
      `Activity: ${activityValue} ${parameter.unit}`,
      `Reporting period: ${period}`,
      `Prepared for prototype review on ${date}`,
      'This generated sample document is for demonstration only.',
    ]);
    const file: ProjectUserEvidence = {
      evidenceId, originalFilename: fileName, systemFilename: `MEIL_${project.subsidiaryId}_${project.businessUnitId}_${project.id}_${person.id}_${parameter.code}_${date.replaceAll('-', '')}.pdf`,
      fileExtension: 'pdf', fileType: 'application/pdf', fileSize: Math.ceil(dataUrl.length * 0.75), meilId: 'MEIL',
      subsidiaryId: project.subsidiaryId, businessUnitId: project.businessUnitId, projectId, userId: person.id, parameterId: parameter.parameterId || parameter.code,
      submissionId, uploadedBy: person.id, uploadedAt: now.toISOString(), verificationStatus: SubmissionStatus.SUBMITTED, dataUrl,
    };
    const emissionValue = factor ? activityValue * (factor.factorValue ?? factor.factor ?? 0) / 1000 : 0;
    const submission: ProjectUserSubmission = {
      submissionId, meilId: 'MEIL', subsidiaryId: project.subsidiaryId, businessUnitId: project.businessUnitId, projectId,
      userId: person.id, parameterId: parameter.parameterId || parameter.code, scope: parameter.scope, dataEntryDate: date, reportingPeriod: period,
      activityValue, activityUnit: parameter.unit, emissionFactorId: factor?.factorId, ...(factor ? { calculation: {
        calculationId: `CALC-${submissionId}`, submissionId, activityValue, activityUnit: parameter.unit, emissionFactorId: factor.factorId || '',
        emissionFactorValue: factor.factorValue ?? factor.factor ?? 0, emissionFactorUnit: factor.unit, emissionFactorSource: factor.source,
        rawKgCO2e: emissionValue * 1000, convertedTonnesCO2e: emissionValue, formula: `${activityValue} × ${factor.factorValue ?? factor.factor} ÷ 1000`, calculatedAt: now.toISOString(),
      } } : {}),
      remarks: `Demo entry for ${parameter.category}; supporting record attached.`, status: SubmissionStatus.SUBMITTED,
      evidenceIds: [evidenceId], submittedAt: now.toISOString(), createdAt: now.toISOString(), updatedAt: now.toISOString(), verificationHistory: [], correctionHistory: [],
    };
    createdSubmissions.push(submission); createdEvidence.push(file);
  }));

  writeStoredValue(MEIL_STORAGE_KEYS.submissions, [...existingSubmissions, ...createdSubmissions]);
  writeStoredValue(MEIL_STORAGE_KEYS.evidence, [...existingEvidence, ...createdEvidence]);
  writeStoredValue('meil_demo_seeded_projects', [...seededProjects, projectId]);
  return { users: projectUsers.length, submissions: createdSubmissions.length, files: createdEvidence.length, seeded: true };
}

export function prepareDemoProjectData(projectId: string): { users: number; submissions: number; files: number } {
  const seedResult = ensureDemoProjectData(projectId);
  const submissions = readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions, []);
  const isGeneratedDemo = (id: string) => id.startsWith(`DEMO-${projectId}-`);
  writeStoredValue(MEIL_STORAGE_KEYS.submissions, submissions.map(submission => isGeneratedDemo(submission.submissionId)
    ? { ...submission, status: SubmissionStatus.SUBMITTED, updatedAt: new Date().toISOString(), verifiedBy: undefined, verificationHistory: (submission.verificationHistory || []).filter(item => item.action !== 'Approved demo submission') }
    : submission));
  const evidence = readStoredValue<ProjectUserEvidence[]>(MEIL_STORAGE_KEYS.evidence, []);
  writeStoredValue(MEIL_STORAGE_KEYS.evidence, evidence.map(file => file.projectId === projectId && isGeneratedDemo(file.submissionId || '') ? { ...file, verificationStatus: SubmissionStatus.SUBMITTED } : file));
  const legacy = readStoredValue<typeof parameterSubmissions>('meil_supervisor_submissions', parameterSubmissions);
  writeStoredValue('meil_supervisor_submissions', legacy.map(item => item.projectId === projectId && (item.id || item.submissionId || '').startsWith(`DEMO-${projectId}-`)
    ? { ...item, status: SubmissionStatus.SUBMITTED, verifiedBy: undefined, verifiedAt: undefined }
    : item));
  return { users: seedResult.users, submissions: submissions.filter(item=>item.projectId===projectId).length, files: evidence.filter(item=>item.projectId===projectId).length };
}
