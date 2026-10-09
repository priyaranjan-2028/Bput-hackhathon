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
export const getAllSubsidiarySupervisors = (): User[] => [...seedUsers, ...readStoredValue<User[]>('meil_subsidiary_supervisors', [])]
  .filter((person, index, all) => person.role === UserRole.SUBSIDIARY_SUPERVISOR && all.findIndex(other => other.id === person.id) === index);

export const createSubsidiary = (input: { name: string; code: string; sector: string; turnover?: number }): Subsidiary => {
  const name = input.name.trim();
  const code = input.code.trim().toUpperCase();
  const sector = input.sector.trim();
  if (!name || !code || !sector) throw new Error('Enter the subsidiary name, code, and sector.');
  if (getStoredSubsidiaries().some(item => item.code.toLowerCase() === code.toLowerCase())) throw new Error('A subsidiary with this code already exists.');
  if (input.turnover !== undefined && (!Number.isFinite(input.turnover) || input.turnover < 0)) throw new Error('Turnover must be zero or a positive number.');
  const created: Subsidiary = { id: `SUB-${Date.now()}`, name, code, meilId: 'MEIL', businessUnitIds: [], sector, ...(input.turnover === undefined ? {} : { turnover: input.turnover }) };
  writeStoredValue('meil_subsidiaries', [...getStoredSubsidiaries(), created]);
  return created;
};

export const createSubsidiarySupervisor = (input: { name: string; email: string; subsidiaryId: string; password?: string }): User => {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const subsidiary = getStoredSubsidiaries().find(item => item.id === input.subsidiaryId);
  if (!subsidiary) throw new Error('Choose a valid subsidiary for this supervisor.');
  if (getAllSubsidiarySupervisors().some(person => person.subsidiaryId === subsidiary.id || person.assignedSubsidiaryIds?.includes(subsidiary.id))) throw new Error('A subsidiary supervisor is already assigned to this entity.');
  if (name.length < 2) throw new Error('Enter the supervisor’s full name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid work email address.');
  const accountLists = [seedUsers, readStoredValue<User[]>('meil_project_users', []), readStoredValue<User[]>('meil_project_supervisors', []), readStoredValue<User[]>('meil_bu_supervisors', []), getAllSubsidiarySupervisors()];
  if (accountLists.flat().some(person => person.email.toLowerCase() === email)) throw new Error('An account already uses this email address.');
  const password = input.password || 'demo123';
  if (password.length < 6) throw new Error('Temporary password must contain at least 6 characters.');
  const id = `USR-SUB-${Date.now()}`;
  const created: User = { id, name, email, password, role: UserRole.SUBSIDIARY_SUPERVISOR, subsidiaryId: subsidiary.id, assignedSubsidiaryIds: [subsidiary.id] };
  writeStoredValue('meil_subsidiary_supervisors', [...getAllSubsidiarySupervisors(), created]);
  writeStoredValue('meil_subsidiaries', getStoredSubsidiaries().map(item => item.id === subsidiary.id ? { ...item, supervisorId: id } : item));
  return created;
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
