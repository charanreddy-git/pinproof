import { test } from "node:test";
import assert from "node:assert/strict";
import { isFreshFix, isProofReady, MAX_FIX_AGE_MS } from "../src/utils/location-verification.ts";

test("only recent device fixes qualify for location verification", () => {
  const now = 100_000;
  assert.equal(isFreshFix(null, now), false);
  assert.equal(isFreshFix({ updatedAt: now - MAX_FIX_AGE_MS }, now), true);
  assert.equal(isFreshFix({ updatedAt: now - MAX_FIX_AGE_MS - 1 }, now), false);
  assert.equal(isFreshFix({ updatedAt: now + 1 }, now), false);
});

test("proof requires both accurate GPS and proximity on a fresh fix", () => {
  const now = 100_000;
  assert.equal(isProofReady({ updatedAt: now, accuracy: 100 }, 100, now), true);
  assert.equal(isProofReady({ updatedAt: now, accuracy: 101 }, 20, now), false);
  assert.equal(isProofReady({ updatedAt: now, accuracy: 10 }, 101, now), false);
  assert.equal(isProofReady({ updatedAt: now - MAX_FIX_AGE_MS - 1, accuracy: 10 }, 20, now), false);
  assert.equal(isProofReady({ updatedAt: now, accuracy: NaN }, 20, now), false);
});
