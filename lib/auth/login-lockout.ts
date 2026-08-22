export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_DURATION_MS = 15 * 60 * 1000;

export interface LockoutState {
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}

/** FR-010c: bloqueo temporal por cuenta, sin servicio de límite de tasa aparte. */
export function isLocked(state: LockoutState, now: Date = new Date()): boolean {
  return state.lockedUntil !== null && state.lockedUntil.getTime() > now.getTime();
}

export function registerFailedAttempt(
  state: LockoutState,
  now: Date = new Date(),
): LockoutState {
  const attempts = state.failedLoginAttempts + 1;
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    return {
      failedLoginAttempts: 0,
      lockedUntil: new Date(now.getTime() + LOCK_DURATION_MS),
    };
  }
  return { failedLoginAttempts: attempts, lockedUntil: state.lockedUntil };
}

export function resetAttempts(): LockoutState {
  return { failedLoginAttempts: 0, lockedUntil: null };
}
