const STORAGE_KEY = 'online-test-app-state';

interface PersistedState {
  subjectId: string;
  subjectName: string;
  currentQuestion: number;
  answers: Record<number, number>;
  timeLeft: number;
  testStarted: boolean;
}

export function saveTestState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable or full — silently ignore
  }
}

export function loadTestState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    // Basic validation
    if (
      typeof parsed.subjectId === 'string' &&
      typeof parsed.subjectName === 'string' &&
      typeof parsed.currentQuestion === 'number' &&
      typeof parsed.answers === 'object' &&
      typeof parsed.timeLeft === 'number' &&
      typeof parsed.testStarted === 'boolean'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearTestState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently ignore
  }
}
