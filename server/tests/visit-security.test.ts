import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFile, unlink, mkdir } from "node:fs/promises";
import path from "node:path";

// Isolated fixtures: no database connection or real user data.
process.env.JWT_SECRET = "pinproof-test-only-secret-not-for-deployment";
process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";

test("private evidence, authorized location, server-priced visits and capture provenance", async (t) => {
  const { default: app } = await import("../src/app");
  const { prisma } = await import("../src/lib");
  const { signToken } = await import("../src/utils/jwt");
  const { TaskService } = await import("../src/services/task.service");
  const { submitTaskSchema } = await import("../src/validators/task.validator");
  const fixture = { id: "visit-test", createdById: "owner", acceptedById: "inspector", evidenceImage: "/uploads/audit-test.png", status: "SUBMITTED", targetLat: 12, targetLng: 77 };
  const originalFind = prisma.task.findUnique;
  const originalEvidenceFind = prisma.evidence.findUnique;
  let databaseEvidence: { data: Buffer; contentType: string } | null = null;
  (prisma.evidence as any).findUnique = async () => databaseEvidence;
  const originalCreate = prisma.task.create;
  const originalUpdate = prisma.task.updateMany;
  const originalFindOrThrow = prisma.task.findUniqueOrThrow;
  const originalTransaction = prisma.$transaction;
  const originalPhotoDelete = prisma.proofPhoto.deleteMany;
  const originalEventCreate = prisma.taskEvent.create;
  (prisma as any).$transaction = async (callback: any) => callback(prisma);
  (prisma.proofPhoto as any).deleteMany = async () => ({ count: 0 });
  (prisma.taskEvent as any).create = async ({ data }: any) => data;
  (prisma.task as any).findUnique = async () => fixture;
  (prisma.task as any).create = async ({ data }: any) => data;
  (prisma.task as any).updateMany = async ({ data }: any) => { stored = data; return { count: 1 }; };
  (prisma.task as any).findUniqueOrThrow = async () => fixture;
  let stored: any;
  const directory = path.join(process.cwd(), "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "audit-test.png"), Buffer.from("test-proof"));
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${(server.address() as any).port}`;
  const headers = (id: string, role: "USER" | "CAPTAIN" = "USER") => ({ Authorization: `Bearer ${signToken({ userId: id, role, phone: "+919999999999" })}` });
  try {
    await t.test("public upload path is unavailable", async () => assert.equal((await fetch(`${base}/uploads/audit-test.png`)).status, 404));
    await t.test("missing credentials cannot read evidence", async () => assert.equal((await fetch(`${base}/api/tasks/visit-test/evidence`)).status, 401));
    await t.test("unrelated account cannot read evidence or location", async () => {
      for (const resource of ["evidence", "location"]) assert.equal((await fetch(`${base}/api/tasks/visit-test/${resource}`, { headers: headers("stranger") })).status, 403);
    });
    await t.test("both participants can read evidence with no-store caching", async () => {
      for (const [id, role] of [["owner", "USER"], ["inspector", "CAPTAIN"]] as const) {
        const response = await fetch(`${base}/api/tasks/visit-test/evidence`, { headers: headers(id, role) });
        assert.equal(response.status, 200); assert.match(response.headers.get("cache-control")!, /no-store/); assert.equal(await response.text(), "test-proof");
      }
    });
    await t.test("path traversal in a stored filename is rejected", async () => {
      fixture.evidenceImage = "/uploads/../secret.png";
      await assert.rejects(TaskService.getEvidencePath("visit-test", "owner")); fixture.evidenceImage = "/uploads/audit-test.png";
    });
    await t.test("database proof stays private and is served without local files", async () => {
      databaseEvidence = { data: Buffer.from("persistent-proof"), contentType: "image/png" };
      const response = await fetch(`${base}/api/tasks/visit-test/evidence`, { headers: headers("owner") });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("content-type"), "image/png");
      assert.equal(await response.text(), "persistent-proof");
      assert.equal((await fetch(`${base}/api/tasks/visit-test/evidence`, { headers: headers("stranger") })).status, 403);
      databaseEvidence = null;
    });
    await t.test("detailed quote is assigned on server, not from client price", async () => {
      const response = await fetch(`${base}/api/tasks`, { method: "POST", headers: { ...headers("owner"), "Content-Type": "application/json" }, body: JSON.stringify({ title: "Check the plot", description: "Check boundary access", latitude: 12, longitude: 77, visitPlan: "DETAILED", quotedPricePaise: 1, propertyType: "Plot & land" }) });
      assert.equal(response.status, 201); const { data } = await response.json() as any; assert.equal(data.visitPlan, "DETAILED"); assert.equal(data.quotedPricePaise, 249900);
    });
    await t.test("uploads do not claim a capture timestamp", async () => {
      fixture.status = "IN_PROGRESS";
      const input = submitTaskSchema.parse({ latitude: 12, longitude: 77, accuracy: 10, evidenceSource: "UPLOAD", capturedAt: new Date().toISOString() });
      await TaskService.submitTask("visit-test", "inspector", input, "/uploads/audit-test.png");
      assert.equal(stored.evidenceCapturedAt, null); assert.equal(stored.evidenceSource, "UPLOAD");
    });
    await t.test("stale camera captures and inaccurate GPS are rejected", async () => {
      await assert.rejects(TaskService.submitTask("visit-test", "inspector", submitTaskSchema.parse({ latitude: 12, longitude: 77, accuracy: 10, evidenceSource: "CAMERA", capturedAt: new Date(Date.now() - 3600000).toISOString() }), "/uploads/audit-test.png"), /fresh photo/);
      await assert.rejects(TaskService.submitTask("visit-test", "inspector", submitTaskSchema.parse({ latitude: 12, longitude: 77, accuracy: 1000 }), "/uploads/audit-test.png"), /GPS accuracy/);
    });
  } finally {
    prisma.$transaction = originalTransaction;
    prisma.proofPhoto.deleteMany = originalPhotoDelete;
    prisma.taskEvent.create = originalEventCreate;
    prisma.evidence.findUnique = originalEvidenceFind;
    prisma.task.findUnique = originalFind; prisma.task.create = originalCreate; prisma.task.updateMany = originalUpdate; prisma.task.findUniqueOrThrow = originalFindOrThrow;
    await unlink(path.join(directory, "audit-test.png"));
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await prisma.$disconnect();
  }
});
