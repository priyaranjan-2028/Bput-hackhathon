import { esgParameters, projects, users } from '../data/mockData';
import { ESGParameter, EmissionFactor, Project, Scope, User, UserRole } from '../types';
import { MEIL_STORAGE_KEYS, readStoredValue, writeStoredValue } from './localStorageService';

const USER_KEY = 'meil_project_users';
const ASSIGNMENT_KEY = MEIL_STORAGE_KEYS.parameterAssignments;
const CUSTOM_PARAMETER_KEY = MEIL_STORAGE_KEYS.parameters;

export function getProjectUsers(projectId: string): User[] {
  const stored = readStoredValue<User[]>(USER_KEY, []);
  const ids = getProject(projectId).userIds ?? [];
  const scoped = [...users, ...stored].filter(user => user.role === UserRole.PROJECT_USER && user.projectId === projectId && (ids.includes(user.id) || stored.some(item => item.id === user.id)));
  return scoped.filter((user, index) => scoped.findIndex(other => other.id === user.id) === index);
}

export function createProjectUser(input: { name: string; email: string }, projectId: string): User {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name || !email) throw new Error('Enter the user’s name and email.');
  if ([...users, ...readStoredValue<User[]>(USER_KEY, [])].some(user => user.email.toLowerCase() === email)) throw new Error('A user with this email already exists.');
  const project = getProject(projectId);
  const businessUnitId = project.businessUnitId;
  const subsidiaryId = project.subsidiaryId;
  const id = `USR-${Date.now().toString(36).toUpperCase()}`;
  const user: User = { id, name, email, role: UserRole.PROJECT_USER, password: 'demo123', projectId, businessUnitId, subsidiaryId };
  const stored = readStoredValue<User[]>(USER_KEY, []);
  writeStoredValue(USER_KEY, [...stored, user]);
  const updatedProject = { ...project, userIds: [...new Set([...(project.userIds ?? []), id])] };
  const projectOverrides = readStoredValue<Record<string, Project>>(MEIL_STORAGE_KEYS.projects, {});
  writeStoredValue(MEIL_STORAGE_KEYS.projects, { ...projectOverrides, [projectId]: updatedProject });
  return user;
}

export function getSupervisorParameters(projectId: string): ESGParameter[] {
  const overrides = readStoredValue<Record<string, ESGParameter[]>>(CUSTOM_PARAMETER_KEY, {});
  const assignedIds = readStoredValue<Record<string, string[]>>(ASSIGNMENT_KEY, {})[projectId] ?? [];
  const catalog = [...esgParameters, ...(overrides[projectId] ?? [])];
  return assignedIds.length ? catalog.filter(parameter => assignedIds.includes(parameter.parameterId ?? parameter.code)) : catalog;
}

export function createProjectParameter(input: {
  name: string; code: string; scope: Scope; category: string; unit: string; description: string; requiresEvidence: boolean;
  factorValue?: number; factorUnit?: string; factorSource?: string;
}, projectId: string): ESGParameter {
  const name = input.name.trim();
  const code = input.code.trim().toUpperCase().replace(/\s+/g, '-');
  if (!name || !code || !input.category.trim() || !input.unit.trim()) throw new Error('Complete the parameter name, code, category, and unit.');
  const project = getProject(projectId);
  const current = getSupervisorParameters(projectId);
  if (current.some(parameter => parameter.code.toLowerCase() === code.toLowerCase())) throw new Error('A parameter with this code already exists in this project.');
  const parameterId = code;
  const needsFactor = input.scope === Scope.SCOPE_1 || input.scope === Scope.SCOPE_2 || input.scope === Scope.SCOPE_3;
  if (needsFactor && (!Number.isFinite(input.factorValue) || (input.factorValue ?? 0) <= 0)) throw new Error('Enter a positive emission factor for Scope 1, 2, or 3 parameters.');
  const parameter: ESGParameter = { parameterId, id: parameterId, name, code, scope: input.scope, category: input.category.trim(), unit: input.unit.trim(), description: input.description.trim(), requiresEvidence: input.requiresEvidence, brsrPrinciple: input.category.trim(), ...(needsFactor ? { emissionFactorId: `EF-${parameterId}` } : {}) };
  const custom = readStoredValue<Record<string, ESGParameter[]>>(CUSTOM_PARAMETER_KEY, {});
  writeStoredValue(CUSTOM_PARAMETER_KEY, { ...custom, [projectId]: [...(custom[projectId] ?? []), parameter] });
  const assignments = readStoredValue<Record<string, string[]>>(ASSIGNMENT_KEY, {});
  writeStoredValue(ASSIGNMENT_KEY, { ...assignments, [projectId]: [...new Set([...(assignments[projectId] ?? esgParameters.map(item => item.parameterId ?? item.code)), parameterId])] });
  if (needsFactor) {
    const factor: EmissionFactor = { factorId: `EF-${parameterId}`, id: `EF-${parameterId}`, parameterId, factorValue: input.factorValue, factor: input.factorValue, unit: input.factorUnit?.trim() || `kgCO2e/${input.unit.trim()}`, scope: input.scope, source: input.factorSource?.trim() || 'Project Supervisor', reportingYear: project.reportingPeriod, methodology: 'Project-specific' };
    const factorOverrides = readStoredValue<Record<string, EmissionFactor[]>>('meil_project_emission_factors', {});
    writeStoredValue('meil_project_emission_factors', { ...factorOverrides, [projectId]: [...(factorOverrides[projectId] ?? []), factor] });
  }
  return parameter;
}

function getProject(projectId: string): Project {
  const overrides = readStoredValue<Record<string, Project>>(MEIL_STORAGE_KEYS.projects, {});
  const project = overrides[projectId] ?? projects.find(item => item.id === projectId);
  if (!project) throw new Error('The assigned project could not be found.');
  return project;
}
