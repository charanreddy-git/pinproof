import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { execFileSync, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { userInfo } from "node:os";

const serverDirectory = fileURLToPath(new URL("../server/", import.meta.url));
const clientDirectory = fileURLToPath(new URL("../client/", import.meta.url));
const require = createRequire(`${serverDirectory}package.json`);
const { PrismaClient } = require("@prisma/client");
const url = new URL(process.env.TEST_DATABASE_URL || `postgresql://${encodeURIComponent(userInfo().username)}@localhost:5432/postgres?sslmode=disable`);
const admin = new PrismaClient({ datasourceUrl: url.toString() });
const schema = `pinproof_browser_${randomUUID().replaceAll("-", "")}`;
url.searchParams.set("schema", schema);
const env = {
  ...process.env,
  DATABASE_URL: url.toString(), NODE_ENV: "test", PORT: "3002",
  JWT_SECRET: "pinproof-browser-tests-only-do-not-deploy-this-key",
  AUTH_MODE: "demo", PUBLIC_DEMO: "false", SMS_PROVIDER: "console",
  CLIENT_URL: "http://localhost:5174", VITE_PROXY_TARGET: "http://localhost:3002", VITE_API_URL: "/api",
};
try {
  await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
  execFileSync(process.execPath, [require.resolve("prisma/build/index.js"), "migrate", "deploy"], { cwd: serverDirectory, env, stdio: "pipe" });
  const code = await new Promise((resolve, reject) => {
    const child = spawn("npm", ["exec", "--", "playwright", "test", ...process.argv.slice(2)], { cwd: clientDirectory, env, stdio: "inherit" });
    child.once("exit", (code) => resolve(code ?? 1));
    child.once("error", reject);
  });
  process.exitCode = code;
} finally {
  await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await admin.$disconnect();
}
