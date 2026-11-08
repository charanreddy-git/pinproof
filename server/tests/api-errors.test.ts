import { test } from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";
import type { AddressInfo } from "node:net";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "pinproof-test-only-secret-not-for-deployment";
process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";

test("API outages return usable JSON without exposing Prisma details", async (t) => {
  const { default: app } = await import("../src/app");
  const { prisma } = await import("../src/lib");
  const originalFind = prisma.phoneOtp.findUnique;
  const originalQuery = prisma.$queryRaw;
  let failure: Error = new Prisma.PrismaClientInitializationError("private database host and query", "6.19.3", "P1001");
  prisma.phoneOtp.findUnique = (() => { throw failure; }) as typeof originalFind;
  prisma.$queryRaw = (() => { throw failure; }) as typeof originalQuery;
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = (body: string) => fetch(`${base}/api/auth/otp/request`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body,
  });
  try {
    await t.test("initial connection failure and runtime pool failures return 503", async () => {
      const failures = [failure, ...["P1001", "P1002", "P1008", "P1017", "P2024"].map(code =>
        new Prisma.PrismaClientKnownRequestError("private database host and query", { code, clientVersion: "6.19.3" }))];
      for (failure of failures) {
        const response = await post(JSON.stringify({ phone: "9876543210" }));
        assert.equal(response.status, 503);
        assert.deepEqual(await response.json(), {
          success: false,
          message: "The database is temporarily unavailable. Please try again shortly.",
        });
      }
    });
    await t.test("health remains machine-readable during a database outage", async () => {
      const response = await fetch(`${base}/api/health`);
      assert.equal(response.status, 503);
      const body = await response.json() as { status: string; message: string };
      assert.equal(body.status, "error");
      assert.match(body.message, /database is temporarily unavailable/);
    });
    await t.test("malformed requests and unknown API routes return JSON", async () => {
      const malformed = await post('{"phone":');
      assert.equal(malformed.status, 400);
      assert.deepEqual(await malformed.json(), { success: false, message: "Request body must be valid JSON." });
      const missing = await fetch(`${base}/api/does-not-exist`);
      assert.equal(missing.status, 404);
      assert.deepEqual(await missing.json(), { success: false, message: "API endpoint not found." });
    });
    await t.test("unique conflicts still return 409", async () => {
      failure = new Prisma.PrismaClientKnownRequestError("private constraint", { code: "P2002", clientVersion: "6.19.3" });
      const response = await post(JSON.stringify({ phone: "9876543210" }));
      assert.equal(response.status, 409);
    });
  } finally {
    prisma.phoneOtp.findUnique = originalFind;
    prisma.$queryRaw = originalQuery;
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await prisma.$disconnect();
  }
});
