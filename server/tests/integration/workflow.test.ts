import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { userInfo } from "node:os";
import { PrismaClient } from "@prisma/client";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

// Every run owns an isolated schema. It never reads the app's .env or demo data.
const database = new URL(process.env.TEST_DATABASE_URL || `postgresql://${encodeURIComponent(userInfo().username)}@localhost:5432/postgres?sslmode=disable`);
const schema = `pinproof_test_${randomUUID().replaceAll("-", "")}`;
const admin = new PrismaClient({ datasourceUrl: database.toString() });
database.searchParams.set("schema", schema);
process.env.DATABASE_URL = database.toString();
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "pinproof-isolated-integration-test-signing-key";
process.env.SMS_PROVIDER = "console";
process.env.AUTH_MODE = "otp";
process.env.PUBLIC_DEMO = "false";

type Session = { token: string; user: { id: string; phone: string; role: string; name: string } };
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jJ1kAAAAASUVORK5CYII=", "base64");

test("real PostgreSQL: phone signup through verified proof, revisions and completion", { timeout: 120_000 }, async (t) => {
  await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
  let server: Server | undefined;
  let prisma: PrismaClient | undefined;
  try {
    execFileSync(process.execPath, [require.resolve("prisma/build/index.js"), "migrate", "deploy"], { env: process.env, stdio: "pipe" });
    const { default: app } = await import("../../src/app");
    prisma = (await import("../../src/lib")).prisma;
    server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server!.once("listening", resolve));
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
    const headers = (session?: Session) => session ? { Authorization: `Bearer ${session.token}` } : {};
    async function request(path: string, method = "GET", body?: unknown, session?: Session) {
      const response = await fetch(`${base}${path}`, { method, headers: { ...headers(session), ...(body !== undefined ? { "Content-Type": "application/json" } : {}) }, body: body !== undefined ? JSON.stringify(body) : undefined });
      const json = await response.json() as any;
      return { status: response.status, ...json };
    }
    async function signup(phone: string, role: "USER" | "CAPTAIN"): Promise<Session> {
      const sent = await request("/auth/otp/request", "POST", { phone });
      assert.equal(sent.status, 200, JSON.stringify(sent));
      assert.match(sent.data.devOtp, /^\d{6}$/);
      const first = await request("/auth/otp/verify", "POST", { phone, code: sent.data.devOtp });
      assert.equal(first.data.requiresProfile, true);
      const verified = await request("/auth/otp/verify", "POST", { phone, code: sent.data.devOtp, name: `${role} test account`, role });
      assert.equal(verified.status, 200, JSON.stringify(verified));
      assert.equal((await request("/auth/otp/verify", "POST", { phone, code: sent.data.devOtp })).status, 400);
      return verified.data;
    }
    const owner = await signup("+919000000001", "USER");
    const stranger = await signup("+919000000002", "USER");
    const inspectorA = await signup("+919000000003", "CAPTAIN");
    const inspectorB = await signup("+919000000004", "CAPTAIN");
    const input = { title: "Boundary and road inspection", description: "Photograph the front gate and check access from the road.", latitude: 12.9719, longitude: 77.6412, visitPlan: "DETAILED", propertyType: "Plot & land", quotedPricePaise: 1 };
    let taskId = "";
    let inspector = inspectorA;
    let unassigned = inspectorB;
    let oldPhotoId = "";
    const taskRequest = (suffix: string, method = "GET", body?: unknown, session: Session = owner) => request(`/tasks/${taskId}${suffix}`, method, body, session);
    async function submit(session: Session, overrides: Record<string, string> = {}, bytes: Buffer = png, supporting = true) {
      const form = new FormData();
      form.append("image", new Blob([new Uint8Array(bytes)], { type: "image/png" }), "proof.png");
      if (supporting) form.append("photos", new Blob([new Uint8Array(png)], { type: "image/png" }), "road.png");
      for (const [key, value] of Object.entries({ latitude: String(input.latitude), longitude: String(input.longitude), accuracy: "8", evidenceSource: "UPLOAD", inspectorNotes: "Gate intact. Road is accessible by car.", ...overrides })) form.append(key, value);
      const response = await fetch(`${base}/tasks/${taskId}/submit`, { method: "POST", headers: headers(session), body: form });
      return { status: response.status, ...await response.json() as any };
    }

    await t.test("sessions, account updates and OTP send windows persist", async () => {
      assert.equal((await request("/auth/me")).status, 401);
      assert.equal((await request("/auth/me", "GET", undefined, owner)).data.id, owner.user.id);
      const profile = await request("/auth/me", "PATCH", { name: "Asha Property Owner", email: "asha@example.test", role: "CAPTAIN" }, owner);
      assert.equal(profile.data.name, "Asha Property Owner");
      assert.equal(profile.data.role, "USER");
      assert.equal((await prisma!.phoneOtp.findUniqueOrThrow({ where: { phone: owner.user.phone } })).sendCount, 1);
      assert.equal((await request("/auth/otp/request", "POST", { phone: owner.user.phone })).status, 429);
    });

    await t.test("book, correct a pin, discover nearby, keep contacts private", async () => {
      const created = await request("/tasks", "POST", input, owner);
      assert.equal(created.status, 201, JSON.stringify(created));
      assert.equal(created.data.quotedPricePaise, 249900);
      taskId = created.data.id;
      assert.equal((await request("/tasks", "POST", input, inspector)).status, 403);
      assert.equal((await taskRequest("", "GET", undefined, stranger)).status, 403);
      const open = await taskRequest("", "GET", undefined, inspector);
      assert.equal(open.data.createdBy.phone, undefined);
      assert.deepEqual(open.data.events, []);
      const changed = await taskRequest("", "PATCH", { ...input, title: "Updated boundary check" });
      assert.equal(changed.status, 200);
      const nearby = await request(`/tasks?filter=available&latitude=${input.latitude}&longitude=${input.longitude}`, "GET", undefined, inspector);
      assert.equal(nearby.data.length, 1);
      assert.equal(nearby.data[0].createdBy.phone, undefined);
      const farAway = await request("/tasks?filter=available&latitude=13.5&longitude=77.6", "GET", undefined, inspector);
      assert.equal(farAway.data.length, 0);
      const link = await request("/tasks/resolve-url", "POST", { url: "https://www.google.com/maps/search/?api=1&query=12.9719%2C77.6412" }, owner);
      assert.deepEqual(link.data, { latitude: input.latitude, longitude: input.longitude });
    });

    await t.test("exactly one inspector wins a simultaneous acceptance", async () => {
      const attempts = await Promise.all([inspectorA, inspectorB].map((candidate) => taskRequest("/accept", "POST", undefined, candidate)));
      assert.deepEqual(attempts.map((result) => result.status).sort(), [200, 400]);
      inspector = attempts[0].status === 200 ? inspectorA : inspectorB;
      unassigned = inspector === inspectorA ? inspectorB : inspectorA;
      assert.equal((await taskRequest("", "PATCH", input)).status, 409);
      assert.equal((await taskRequest("/start", "POST", undefined, unassigned)).status, 403);
      assert.equal((await taskRequest("/start", "POST", undefined, inspector)).status, 200);
      assert.equal((await taskRequest("/start", "POST", undefined, inspector)).status, 409);
      assert.equal((await taskRequest("", "GET", undefined, inspector)).data.createdBy.phone, owner.user.phone);
    });

    await t.test("live GPS is persisted immediately and only shared with participants", async () => {
      assert.equal((await taskRequest("/location", "POST", { latitude: 12.97, longitude: 77.64 }, unassigned)).status, 403);
      for (const latitude of [12.97, input.latitude]) {
        assert.equal((await taskRequest("/location", "POST", { latitude, longitude: input.longitude }, inspector)).status, 202);
      }
      const location = await taskRequest("/location");
      assert.equal(location.data.latitude, input.latitude);
      assert.equal(await prisma!.locationLog.count({ where: { taskId } }), 2);
      assert.equal((await taskRequest("/location", "GET", undefined, stranger)).status, 403);
      assert.equal((await taskRequest("/cancel", "POST", { reason: "Cannot cancel after travelling" })).status, 409);
    });

    await t.test("reject bad photos, distant or inaccurate GPS, and old camera captures", async () => {
      assert.equal((await submit(inspector, {}, Buffer.from("not a PNG"))).status, 400);
      assert.equal((await submit(inspector, { latitude: "13.5" })).status, 400);
      assert.equal((await submit(inspector, { accuracy: "150" })).status, 400);
      assert.equal((await submit(inspector, { accuracy: "" })).status, 400);
      assert.equal((await submit(inspector, { evidenceSource: "CAMERA", capturedAt: new Date(Date.now() - 3600000).toISOString() })).status, 400);
      assert.equal((await submit(unassigned)).status, 403);
      assert.equal((await taskRequest("")).data.status, "IN_PROGRESS");
    });

    await t.test("multi-photo report is atomic, private, downloadable, and has honest provenance", async () => {
      const result = await submit(inspector, { capturedAt: new Date().toISOString() });
      assert.equal(result.status, 200, JSON.stringify(result));
      assert.equal(result.data.status, "SUBMITTED");
      assert.equal(result.data.evidenceCapturedAt, null);
      const detail = (await taskRequest("")).data;
      assert.equal(detail.photos.length, 1);
      assert.equal(detail.inspectorNotes, "Gate intact. Road is accessible by car.");
      oldPhotoId = detail.photos[0].id;
      for (const resource of ["evidence", `photos/${oldPhotoId}`]) {
        assert.equal((await fetch(`${base}/tasks/${taskId}/${resource}`)).status, 401);
        assert.equal((await fetch(`${base}/tasks/${taskId}/${resource}`, { headers: headers(stranger) })).status, 403);
        for (const participant of [owner, inspector]) {
          const response = await fetch(`${base}/tasks/${taskId}/${resource}`, { headers: headers(participant) });
          assert.equal(response.status, 200);
          assert.match(response.headers.get("cache-control")!, /no-store/);
          assert.deepEqual(Buffer.from(await response.arrayBuffer()), png);
        }
      }
      assert.equal((await submit(inspector)).status, 400);
      assert.equal((await taskRequest("/location", "POST", { latitude: input.latitude, longitude: input.longitude }, inspector)).status, 409);
    });

    await t.test("request changes, submit replacement proof, approve, and retain the history", async () => {
      assert.equal((await taskRequest("/revision", "POST", { reason: "Please photograph the rear boundary too." }, stranger)).status, 403);
      const revision = await taskRequest("/revision", "POST", { reason: "Please photograph the rear boundary too." });
      assert.equal(revision.data.status, "IN_PROGRESS");
      assert.ok(revision.data.revisionNote);
      assert.equal((await taskRequest("/complete", "POST")).status, 409);
      const fresh = await submit(inspector, { evidenceSource: "CAMERA", capturedAt: new Date().toISOString(), inspectorNotes: "Rear boundary is intact. All requested checks completed." });
      assert.equal(fresh.status, 200);
      assert.equal(fresh.data.revisionNote, null);
      assert.ok(fresh.data.evidenceCapturedAt);
      assert.equal((await fetch(`${base}/tasks/${taskId}/photos/${oldPhotoId}`, { headers: headers(owner) })).status, 404);
      assert.equal((await taskRequest("/complete", "POST", undefined, stranger)).status, 403);
      const completions = await Promise.all([taskRequest("/complete", "POST"), taskRequest("/complete", "POST")]);
      assert.deepEqual(completions.map((result) => result.status).sort(), [200, 409]);
      const finished = (await taskRequest("")).data;
      assert.equal(finished.status, "COMPLETED");
      assert.ok(finished.completedAt);
      assert.deepEqual(finished.events.map((event: any) => event.action), ["CREATED", "UPDATED", "ACCEPTED", "STARTED", "SUBMITTED", "REVISION_REQUESTED", "SUBMITTED", "COMPLETED"]);
      assert.equal((await taskRequest("/revision", "POST", { reason: "Try to reopen the closed visit" })).status, 409);
    });

    await t.test("release and cancel are recoverable paths, with contact access revoked on release", async () => {
      taskId = (await request("/tasks", "POST", input, owner)).data.id;
      assert.equal((await taskRequest("/accept", "POST", undefined, inspector)).status, 200);
      assert.equal((await taskRequest("/release", "POST", { reason: "Unable to reach this property today." }, inspector)).status, 200);
      const reopened = (await taskRequest("", "GET", undefined, inspector)).data;
      assert.equal(reopened.status, "OPEN");
      assert.equal(reopened.acceptedById, null);
      assert.equal(reopened.createdBy.phone, undefined);
      assert.equal((await taskRequest("/location", "GET", undefined, inspector)).status, 403);
      assert.equal((await taskRequest("/accept", "POST", undefined, unassigned)).status, 200);
      assert.equal((await taskRequest("/cancel", "POST", { reason: "Property access is no longer available." })).data.status, "CANCELLED");
      assert.equal((await taskRequest("/start", "POST", undefined, unassigned)).status, 409);
      const past = (await request("/tasks?filter=accepted", "GET", undefined, unassigned)).data;
      assert.ok(past.some((visit: any) => visit.id === taskId && visit.status === "CANCELLED"));
    });

    await t.test("start versus cancellation cannot overwrite each other's transition", async () => {
      taskId = (await request("/tasks", "POST", input, owner)).data.id;
      await taskRequest("/accept", "POST", undefined, inspector);
      const race = await Promise.all([taskRequest("/start", "POST", undefined, inspector), taskRequest("/cancel", "POST", { reason: "Owner needs to cancel this visit." })]);
      assert.deepEqual(race.map((result) => result.status).sort(), [200, 409]);
      const detail = (await taskRequest("")).data;
      assert.equal(detail.events.length, 3);
      assert.ok(["CANCELLED", "IN_PROGRESS"].includes(detail.status));
    });

    await t.test("a code can issue only one session even with concurrent verification", async () => {
      await prisma!.phoneOtp.update({ where: { phone: owner.user.phone }, data: { lastSentAt: new Date(0) } });
      const sent = await request("/auth/otp/request", "POST", { phone: owner.user.phone });
      const races = await Promise.all([1, 2].map(() => request("/auth/otp/verify", "POST", { phone: owner.user.phone, code: sent.data.devOtp })));
      assert.equal(races.filter((result) => result.status === 200).length, 1);
      assert.equal(races.filter((result) => [400, 401].includes(result.status)).length, 1);
      assert.equal((await prisma!.phoneOtp.findUniqueOrThrow({ where: { phone: owner.user.phone } })).sendCount, 2);
    });
  } finally {
    if (server) await new Promise<void>((resolve) => server!.close(() => resolve()));
    await prisma?.$disconnect();
    await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await admin.$disconnect();
  }
});
