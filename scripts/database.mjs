import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL("../server/", import.meta.url));
const require = createRequire(`${directory}package.json`);
const dotenv = require("dotenv");
if (process.env.NODE_ENV !== "production") dotenv.config({ path: `${directory}.env.development.local` });
dotenv.config({ path: `${directory}.env` });
const child = spawn(process.execPath, [require.resolve("prisma/build/index.js"), ...process.argv.slice(2)], { cwd: directory, stdio: "inherit", env: process.env });
child.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
