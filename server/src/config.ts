import dotenv from "dotenv";

// An optional local-only override keeps development off a deployed database.
// Explicit process variables always take priority (CI, tests, and hosting).
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.development.local" });
}
dotenv.config();
