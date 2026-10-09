// ============================================================
// Centralized LocalStorage Service for MEIL ESG/BRSR Portal
// Designed to be replaced with FastAPI + PostgreSQL endpoints
// ============================================================

export const MEIL_STORAGE_KEYS = {
  auth: 'meil_auth',
  currentUser: 'meil_current_user',
  projects: 'meil_projects',
  parameters: 'meil_parameters',
  parameterAssignments: 'meil_parameter_assignments',
  submissions: 'meil_submissions',
  evidence: 'meil_evidence',
  calculations: 'meil_calculations',
  verifications: 'meil_verifications',
  notifications: 'meil_notifications',
  auditLog: 'meil_audit_log',
} as const;

// Backward-compatibility alias
export const PROJECT_USER_STORAGE_KEYS = {
  submissions: MEIL_STORAGE_KEYS.submissions,
  evidence: MEIL_STORAGE_KEYS.evidence,
  notifications: MEIL_STORAGE_KEYS.notifications,
  auditLog: MEIL_STORAGE_KEYS.auditLog,
} as const;

export function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const rawValue = window.localStorage.getItem(key);
    if (rawValue === null || rawValue === undefined) return fallback;
    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.warn(`[localStorageService] Failed to parse key "${key}", returning fallback.`, error);
    return fallback;
  }
}

export function writeStoredValue<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[localStorageService] Failed to write key "${key}".`, error);
    throw new Error(`Could not save ${key} data in this browser. Check available storage and try again.`, { cause: error });
  }
}

export function removeStoredValue(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`[localStorageService] Failed to remove key "${key}".`, error);
  }
}

export function clearAllMeilStorage(): void {
  Object.values(MEIL_STORAGE_KEYS).forEach(key => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
}
