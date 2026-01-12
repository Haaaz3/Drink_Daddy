import { STORAGE_KEYS } from './constants';

export function getProfile() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function getDrinks() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DRINKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDrinks(drinks) {
  localStorage.setItem(STORAGE_KEYS.DRINKS, JSON.stringify(drinks));
}

export function getSession() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : { foodStatus: 'NONE', startTime: null };
  } catch {
    return { foodStatus: 'NONE', startTime: null };
  }
}

export function saveSession(session) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.DRINKS);
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}
