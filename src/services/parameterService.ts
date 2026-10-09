import {
  emissionFactors,
  esgParameters,
  projects,
  getEmissionFactorByParameterId,
} from '../data/mockData';
import { ESGParameter, EmissionFactor, Scope } from '../types';
import { readStoredValue, MEIL_STORAGE_KEYS } from './localStorageService';

export interface AssignedProjectParameter extends ESGParameter {
  calculationRequired: boolean;
  assignedUserIds: string[];
  emissionFactor?: EmissionFactor;
}

export function getAssignedParameters(userId: string): AssignedProjectParameter[] {
  const storedUser = window.localStorage.getItem('meil_esg_user');
  let projectId: string | undefined;
  try {
    if (storedUser) {
      const sessionUser = JSON.parse(storedUser) as { id?: string; projectId?: string; assignedProjectIds?: string[] };
      if (sessionUser.id === userId) projectId = sessionUser.projectId ?? sessionUser.assignedProjectIds?.[0];
    }
  } catch { projectId = undefined; }
  projectId ??= readStoredValue<Record<string, string[]>>(MEIL_STORAGE_KEYS.projects, {}) &&
    projects.find(project => project.userIds?.includes(userId))?.id;
  const projectOverrides = readStoredValue<Record<string, ESGParameter[]>>(MEIL_STORAGE_KEYS.parameters, {});
  const customParameters = projectId ? projectOverrides[projectId] ?? [] : [];
  const assignedIds = projectId ? readStoredValue<Record<string, string[]>>(MEIL_STORAGE_KEYS.parameterAssignments, {})[projectId] : undefined;
  const catalog = [...esgParameters, ...customParameters].filter(parameter => !assignedIds || assignedIds.includes(parameter.parameterId ?? parameter.code));
  const projectFactors = projectId ? readStoredValue<Record<string, EmissionFactor[]>>('meil_project_emission_factors', {})[projectId] ?? [] : [];
  return catalog.map(parameter => ({
    ...parameter,
    assignedUserIds: [userId],
    calculationRequired: parameter.scope !== Scope.SECTION_C,
    emissionFactor: parameter.emissionFactorId
      ? projectFactors.find(factor => factor.parameterId === (parameter.parameterId ?? parameter.code)) ?? getEmissionFactorByParameterId(parameter.parameterId ?? '')
      : undefined,
  }));
}

export function getAssignedParameter(userId: string, parameterId: string): AssignedProjectParameter | undefined {
  return getAssignedParameters(userId).find(parameter => parameter.parameterId === parameterId);
}

export function getAllDemoEmissionFactors(): EmissionFactor[] {
  return emissionFactors;
}
