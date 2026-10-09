// ============================================================
// MEIL ESG Portal — Authentication Service
// Ready for FastAPI + PostgreSQL JWT/OAuth2 backend integration
// ============================================================

import { User, UserRole } from '../types';
import { users as mockUsers } from '../data/mockData';
import { MEIL_STORAGE_KEYS, readStoredValue, writeStoredValue, removeStoredValue } from './localStorageService';

export interface AuthSession {
  user: User;
  token?: string;
  expiresAt?: string;
}

export function getCurrentUser(): User | null {
  const session = readStoredValue<AuthSession | null>(MEIL_STORAGE_KEYS.auth, null);
  if (session?.user) return session.user;
  
  // Backward compatibility with meil_esg_user
  try {
    const legacy = window.localStorage.getItem('meil_esg_user');
    if (legacy) {
      const parsed = JSON.parse(legacy) as User;
      const verified = mockUsers.find(u => u.id === parsed.id);
      if (verified) return verified;
    }
  } catch {
    // ignore
  }

  return null;
}

export function loginUser(email: string, password: string): User | null {
  const allUsers = [...mockUsers, ...readStoredValue<User[]>('meil_project_users', [])];
  const user = allUsers.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  ) ?? (email.toLowerCase() === 'projectuser@demo.com' && password === 'demo123' ? allUsers.find(account => account.email === 'anita@demo.com') : undefined);

  if (user) {
    const session: AuthSession = {
      user,
      token: `demo-token-${user.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    };
    writeStoredValue(MEIL_STORAGE_KEYS.auth, session);
    writeStoredValue(MEIL_STORAGE_KEYS.currentUser, user);
    window.localStorage.setItem('meil_esg_user', JSON.stringify(user));
    return user;
  }

  return null;
}

export function logoutUser(): void {
  removeStoredValue(MEIL_STORAGE_KEYS.auth);
  removeStoredValue(MEIL_STORAGE_KEYS.currentUser);
  window.localStorage.removeItem('meil_esg_user');
}

export function isProjectUser(user: User | null): boolean {
  return user?.role === UserRole.PROJECT_USER;
}
