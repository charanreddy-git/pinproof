import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  workers: 1,
  retries: 0,
  reporter: "list",
  use: { baseURL: "http://localhost:5174", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: [
    { command: "npm run dev", cwd: "../server", url: "http://localhost:3002/api/health", reuseExistingServer: false },
    { command: "npm run dev -- --port 5174 --strictPort", url: "http://localhost:5174", reuseExistingServer: false },
  ],
});
