export const MAX_FIX_AGE_MS = 30_000;
export const MAX_PROOF_ACCURACY_METRES = 100;

export function isFreshFix(fix: { updatedAt: number } | null, now = Date.now()): boolean {
  return fix !== null && Number.isFinite(fix.updatedAt) &&
    fix.updatedAt <= now && now - fix.updatedAt <= MAX_FIX_AGE_MS;
}

export function isProofReady(
  fix: { updatedAt: number; accuracy: number } | null,
  distanceMetres: number | null,
  now = Date.now(),
): boolean {
  return isFreshFix(fix, now) && Number.isFinite(fix!.accuracy) &&
    fix!.accuracy <= MAX_PROOF_ACCURACY_METRES &&
    distanceMetres !== null && Number.isFinite(distanceMetres) && distanceMetres <= 100;
}
