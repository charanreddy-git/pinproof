import { test } from "node:test";
import assert from "node:assert/strict";
import { isDemoAuthEnabled } from "../src/utils/auth-mode";

test("production demo requires both flags; production OTP never becomes console auth", () => {
  const saved = { NODE_ENV: process.env.NODE_ENV, AUTH_MODE: process.env.AUTH_MODE, PUBLIC_DEMO: process.env.PUBLIC_DEMO };
  try {
    process.env.NODE_ENV = "production";
    process.env.AUTH_MODE = "demo";
    delete process.env.PUBLIC_DEMO;
    assert.equal(isDemoAuthEnabled(), false);
    process.env.PUBLIC_DEMO = "false";
    assert.equal(isDemoAuthEnabled(), false);
    process.env.PUBLIC_DEMO = "true";
    assert.equal(isDemoAuthEnabled(), true);
    process.env.AUTH_MODE = "otp";
    assert.equal(isDemoAuthEnabled(), false);
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
