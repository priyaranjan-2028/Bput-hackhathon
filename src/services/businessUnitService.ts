import { businessUnits, projects as seedProjects, users as seedUsers } from '../data/mockData';
import { BusinessUnit, Project, User, UserRole } from '../types';
import { readStoredValue, writeStoredValue } from './localStorageService';

export const getCurrentBusinessUnit = (user?: User | null): BusinessUnit => {
  const stored = readStoredValue<BusinessUnit[]>('meil_business_units', []);
  const units = [...businessUnits, ...stored].map(unit => stored.find(item => item.id === unit.id) || unit)
    .filter((unit,index,all)=>all.findIndex(item=>item.id===unit.id)===index);
  return units.find(unit => unit.id === user?.businessUnitId)
    || units.find(unit => unit.supervisorId === user?.id)
    || units.find(unit => user?.assignedBUIds?.includes(unit.id))
    || units[0];
};

export const getBusinessUnitProjects = (buId: string): Project[] => {
  const stored = readStoredValue<Record<string, Project>>('meil_projects', {});
  const merged = seedProjects.map(project => stored[project.id] || project);
  Object.values(stored).forEach(project => { if (!merged.some(item => item.id === project.id)) merged.push(project); });
  return merged.filter(project => project.businessUnitId === buId);
};

export const getBusinessUnitSupervisors = (buId: string): User[] => {
  const stored = readStoredValue<User[]>('meil_project_supervisors', []);
  const projectIds = getBusinessUnitProjects(buId).map(project => project.id);
  return [...seedUsers, ...stored].filter((user, index, all) =>
    user.role === UserRole.PROJECT_SUPERVISOR
    && (user.businessUnitId === buId || user.assignedBUIds?.includes(buId) || user.assignedProjectIds?.some(id => projectIds.includes(id)))
    && all.findIndex(other => other.id === user.id) === index
  );
};

export const createBusinessUnitProject = (input: Omit<Project, 'id' | 'businessUnitId' | 'subsidiaryId'>, bu: BusinessUnit): Project => {
  const allProjects = getBusinessUnitProjects(bu.id);
  if (allProjects.some(project => project.code.toLowerCase() === input.code.trim().toLowerCase())) throw new Error('A project with this code already exists in this business unit.');
  const project: Project = { ...input, id: `PRJ-${Date.now()}`, code: input.code.trim().toUpperCase(), name: input.name.trim(), businessUnitId: bu.id, subsidiaryId: bu.subsidiaryId, status: input.status };
  const stored = readStoredValue<Record<string, Project>>('meil_projects', {});
  writeStoredValue('meil_projects', { ...stored, [project.id]: project });
  return project;
};

export const createBusinessUnitSupervisor = (input: { name: string; email: string; projectId?: string }, bu: BusinessUnit): User => {
  const existing = [...seedUsers, ...readStoredValue<User[]>('meil_project_supervisors', [])];
  if (existing.some(user => user.email.toLowerCase() === input.email.trim().toLowerCase())) throw new Error('An account already uses this email address.');
  const user: User = { id: `USR-PS-${Date.now()}`, name: input.name.trim(), email: input.email.trim().toLowerCase(), password: 'demo123', role: UserRole.PROJECT_SUPERVISOR, businessUnitId: bu.id, subsidiaryId: bu.subsidiaryId, assignedBUIds: [bu.id], assignedProjectIds: input.projectId ? [input.projectId] : [] };
  writeStoredValue('meil_project_supervisors', [...readStoredValue<User[]>('meil_project_supervisors', []), user]);
  if (input.projectId) {
    const stored = readStoredValue<Record<string, Project>>('meil_projects', {});
    const project = getBusinessUnitProjects(bu.id).find(item => item.id === input.projectId);
    if (project) writeStoredValue('meil_projects', { ...stored, [project.id]: { ...project, supervisorId: user.id } });
  }
  return user;
};
