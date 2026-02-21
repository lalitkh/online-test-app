const ADMIN_VISIBILITY_KEY = 'admin-test-visibility';
const ADMIN_SESSION_KEY = 'admin-session';

// Admin password — stored client-side only (UI-level access control)
export const ADMIN_PASSWORD = 'admin123';

export function loadVisibilitySettings(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(ADMIN_VISIBILITY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, boolean>;
    }
    return {};
  } catch {
    return {};
  }
}

export function saveVisibilitySettings(settings: Record<string, boolean>): void {
  try {
    localStorage.setItem(ADMIN_VISIBILITY_KEY, JSON.stringify(settings));
  } catch {
    // silently ignore
  }
}

export function getTestVisibility(subjectId: string, defaultActive = true): boolean {
  const settings = loadVisibilitySettings();
  if (subjectId in settings) {
    return settings[subjectId];
  }
  return defaultActive;
}

export function isAdminAuthenticated(): boolean {
  try {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(value: boolean): void {
  try {
    if (value) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch {
    // silently ignore
  }
}
