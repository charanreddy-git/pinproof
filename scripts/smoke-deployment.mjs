// Read-only smoke test against a deployed preview or production origin.
// Usage: node scripts/smoke-deployment.mjs https://example.vercel.app
const origin = process.argv[2];
if (!origin || !/^https:\/\/[^/]+$/.test(origin)) {
  console.error("Provide an HTTPS origin without a trailing slash.");
  process.exit(2);
}

const probes = [
  { path: "/api/health", status: 200 },
  { path: "/api/ready", status: 200 },
  { path: "/api/auth/mode", status: 200 },
  { path: "/api/auth/me", status: 401 },
  { path: "/api/tasks", status: 401 },
  { path: "/api/tasks/smoke-not-found", status: 401 },
  { path: "/api/tasks/smoke-not-found/location", status: 401 },
  { path: "/api/tasks/smoke-not-found/photos/smoke-photo", status: 401 },
  { path: "/api/tasks/resolve-url", method: "POST", status: 401 },
  { path: "/api/auth/otp/request", method: "POST", status: [400, 403] },
];

let failed = false;
for (const { path, method = "GET", status } of probes) {
  try {
    const response = await fetch(`${origin}${path}`, {
      method,
      redirect: "manual",
      headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
      body: method === "POST" ? "{}" : undefined,
      signal: AbortSignal.timeout(15_000),
    });
    const type = response.headers.get("content-type") ?? "";
    const ok = (Array.isArray(status) ? status.includes(response.status) : response.status === status) &&
      type.includes("application/json");
    console.log(`${ok ? "PASS" : "FAIL"} ${method} ${path} → ${response.status} ${type}`);
    failed ||= !ok;
  } catch (error) {
    console.error(`FAIL ${method} ${path}: ${error instanceof Error ? error.message : error}`);
    failed = true;
  }
}
process.exitCode = failed ? 1 : 0;
