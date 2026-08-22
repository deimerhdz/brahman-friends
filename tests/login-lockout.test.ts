import { describe, it, expect } from "vitest";
import {
  MAX_FAILED_ATTEMPTS,
  LOCK_DURATION_MS,
  isLocked,
  registerFailedAttempt,
  resetAttempts,
} from "@/lib/auth/login-lockout";

describe("bloqueo por intentos fallidos (FR-010c)", () => {
  it("no está bloqueado sin intentos fallidos", () => {
    expect(isLocked({ failedLoginAttempts: 0, lockedUntil: null })).toBe(false);
  });

  it("no bloquea antes de llegar al umbral", () => {
    let state = { failedLoginAttempts: 0, lockedUntil: null as Date | null };
    for (let i = 0; i < MAX_FAILED_ATTEMPTS - 1; i++) {
      state = registerFailedAttempt(state);
    }
    expect(state.failedLoginAttempts).toBe(MAX_FAILED_ATTEMPTS - 1);
    expect(isLocked(state)).toBe(false);
  });

  it("bloquea al alcanzar el umbral, reiniciando el contador", () => {
    let state = { failedLoginAttempts: 0, lockedUntil: null as Date | null };
    const before = Date.now();
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
      state = registerFailedAttempt(state);
    }
    expect(state.failedLoginAttempts).toBe(0);
    expect(state.lockedUntil).not.toBeNull();
    expect(state.lockedUntil!.getTime()).toBeGreaterThanOrEqual(
      before + LOCK_DURATION_MS,
    );
    expect(isLocked(state)).toBe(true);
  });

  it("deja de estar bloqueado una vez pasado `lockedUntil`", () => {
    const state = {
      failedLoginAttempts: 0,
      lockedUntil: new Date(Date.now() - 1000),
    };
    expect(isLocked(state)).toBe(false);
  });

  it("un login exitoso reinicia el contador y el bloqueo", () => {
    const state = resetAttempts();
    expect(state).toEqual({ failedLoginAttempts: 0, lockedUntil: null });
  });
});
