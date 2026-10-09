import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState } from '../types';
import { users as mockUsers } from '../data/mockData';
import { readStoredValue } from '../services/localStorageService';

const getAllLoginUsers = (): User[] => [...mockUsers, ...readStoredValue<User[]>('meil_project_users', []), ...readStoredValue<User[]>('meil_project_supervisors', []), ...readStoredValue<User[]>('meil_bu_supervisors', []), ...readStoredValue<User[]>('meil_subsidiary_supervisors', [])].filter((candidate, index, all) => all.findIndex(other => other.id === candidate.id) === index);
const findLoginUser = (email: string, password: string): User | undefined => {
  const normalizedEmail = email.trim().toLowerCase();
  const account = getAllLoginUsers().find(candidate => candidate.email.toLowerCase() === normalizedEmail && candidate.password === password);
  if (account) return account;
  return normalizedEmail === 'projectuser@demo.com' && password === 'demo123'
    ? getAllLoginUsers().find(candidate => candidate.email === 'anita@demo.com')
    : undefined;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('meil_esg_user');
    if (!stored) return null;

    try {
      const storedUser = JSON.parse(stored) as Pick<User, 'id' | 'email' | 'role'>;
      const authenticatedUser = getAllLoginUsers().find(
        candidate => candidate.id === storedUser.id
          && candidate.email === storedUser.email
          && candidate.role === storedUser.role
      );
      if (!authenticatedUser) {
        localStorage.removeItem('meil_esg_user');
        return null;
      }
      return authenticatedUser;
    } catch {
      localStorage.removeItem('meil_esg_user');
      return null;
    }
  });
  const isAuthenticated = user !== null;

  const login = (email: string, password: string): User | null => {
    const found = findLoginUser(email, password);
    if (found) {
      setUser(found);
      localStorage.setItem('meil_esg_user', JSON.stringify(found));
      return found;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('meil_esg_user');
  };

  const register = (_user: Partial<User>): boolean => {
    // Mock registration — in production, this would hit the API
    return true;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getRolePath(role: UserRole): string {
  switch (role) {
    case UserRole.PROJECT_USER: return '/project-user';
    case UserRole.PROJECT_SUPERVISOR: return '/project-supervisor';
    case UserRole.BU_SUPERVISOR: return '/business-unit';
    case UserRole.SUBSIDIARY_SUPERVISOR: return '/subsidiary';
    case UserRole.MEIL_ADMIN: return '/admin';
    default: return '/login';
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.PROJECT_USER: return 'Project Data User';
    case UserRole.PROJECT_SUPERVISOR: return 'Project Supervisor';
    case UserRole.BU_SUPERVISOR: return 'Business Unit Supervisor';
    case UserRole.SUBSIDIARY_SUPERVISOR: return 'Subsidiary Supervisor';
    case UserRole.MEIL_ADMIN: return 'MEIL Main Admin';
    default: return 'Unknown';
  }
}
