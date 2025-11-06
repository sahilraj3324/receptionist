// Authentication utilities
import type { Receptionist } from './api';

const AUTH_STORAGE_KEY = 'receptionist';

export const getStoredReceptionist = (): Receptionist | null => {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
  return null;
};

export const setStoredReceptionist = (receptionist: Receptionist): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(receptionist));
};

export const clearStoredReceptionist = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const isAuthenticated = (): boolean => {
  return getStoredReceptionist() !== null;
};

