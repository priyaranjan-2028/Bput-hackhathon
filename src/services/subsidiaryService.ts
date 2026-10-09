import { businessUnits as seedBusinessUnits, projects as seedProjects, subsidiaries as seedSubsidiaries, users as seedUsers } from '../data/mockData';
import { BusinessUnit, Subsidiary, User, UserRole } from '../types';
import { readStoredValue, writeStoredValue } from './localStorageService';

export const getBusinessUnits = (): BusinessUnit[] => {
  const stored = readStoredValue<BusinessUnit[]>('meil_business_units', []);
  return [...seedBusinessUnits, ...stored].map(unit => stored.find(item => item.id === unit.id) || unit)
    .filter((unit, index, all) => all.findIndex(item => item.id === unit.id) === index);
};
export const getStoredSubsidiaries = (): Subsidiary[] => {
  const stored = readStoredValue<Subsidiary[]>('meil_subsidiaries', []);
  return [...seedSubsidiaries, ...stored].map(item => stored.find(record => record.id === item.id) || item)
    .filter((item,index,all)=>all.findIndex(record=>record.id===item.id)===index);
};
export const getCurrentSubsidiary = (user?: User | null): Subsidiary => {
  const subsidiaries = getStoredSubsidiaries();
  return subsidiaries.find(item => item.id === user?.subsidiaryId)
    || subsidiaries.find(item => item.supervisorId === user?.id)
    || subsidiaries.find(item => user?.assignedSubsidiaryIds?.includes(item.id))
    || subsidiaries[0];
};
export const getSubsidiaryBusinessUnits = (subsidiaryId: string): BusinessUnit[] => getBusinessUnits().filter(unit => unit.subsidiaryId === subsidiaryId);
export const getSubsidiarySupervisors = (subsidiaryId: string): User[] => {
  const stored = readStoredValue<User[]>('meil_bu_supervisors', []);
  return [...seedUsers, ...stored].filter((person, index, all) => person.role === UserRole.BU_SUPERVISOR
    && (person.subsidiaryId === subsidiaryId || person.assignedBUIds?.some(id => getSubsidiaryBusinessUnits(subsidiaryId).some(unit => unit.id === id)))
    && all.findIndex(other => other.id === person.id) === index);
};
export const createSubsidiaryBusinessUnit = (input: { name: string; code: string }, subsidiary: Subsidiary): BusinessUnit => {
  const units = getBusinessUnits();
  const code = input.code.trim().toUpperCase();
  if (units.some(unit => unit.code.toLowerCase() === code.toLowerCase())) throw new Error('A business unit with this code already exists.');
  const unit: BusinessUnit = { id: `BU-${Date.now()}`, name: input.name.trim(), code, subsidiaryId: subsidiary.id, projectIds: [] };
  writeStoredValue('meil_business_units', [...units, unit]);
  writeStoredValue('meil_subsidiaries', getStoredSubsidiaries().map(item => item.id === subsidiary.id ? { ...item, businessUnitIds: [...new Set([...(item.businessUnitIds ?? []), unit.id])] } : item));
  return unit;
};
export const createSubsidiaryBUSupervisor = (input: { name: string; email: string; businessUnitId: string }, subsidiary: Subsidiary): User => {
  const unit = getSubsidiaryBusinessUnits(subsidiary.id).find(item => item.id === input.businessUnitId);
  if (!unit) throw new Error('Select a business unit assigned to this subsidiary.');
  const existing = [...seedUsers, ...readStoredValue<User[]>('meil_bu_supervisors', [])];
  if (existing.some(person => person.email.toLowerCase() === input.email.trim().toLowerCase())) throw new Error('An account already uses this email address.');
  const created: User = { id: `USR-BU-${Date.now()}`, name: input.name.trim(), email: input.email.trim().toLowerCase(), password: 'demo123', role: UserRole.BU_SUPERVISOR, businessUnitId: unit.id, subsidiaryId: subsidiary.id, assignedBUIds: [unit.id] };
  writeStoredValue('meil_bu_supervisors', [...readStoredValue<User[]>('meil_bu_supervisors', []), created]);
  writeStoredValue('meil_business_units', getBusinessUnits().map(item => item.id === unit.id ? { ...item, supervisorId: created.id } : item));
  return created;
};
export const getSubsidiaryProjects = (subsidiaryId: string) => {
  const stored = readStoredValue<Record<string, (typeof seedProjects)[number]>>('meil_projects', {});
  const merged = seedProjects.map(project => stored[project.id] || project);
  Object.values(stored).forEach(project => { if (!merged.some(item => item.id === project.id)) merged.push(project); });
  return merged.filter(project => project.subsidiaryId === subsidiaryId);
};
