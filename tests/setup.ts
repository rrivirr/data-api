import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// `get-config.ts` reads/writes `~/.data-api/config` and needs the config env at
// import time, so isolate HOME and provide the values before any module loads.
const home = mkdtempSync(path.join(tmpdir(), "data-api-test-"));
process.env.HOME = home;
process.env.USERPROFILE = home;

// The pool is lazy: nothing connects unless a query actually runs.
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test";
process.env.KEYCLOAK_URL = "http://127.0.0.1:4595";
process.env.KEYCLOAK_REALM = "test";
process.env.LOG_LEVEL = "error";
// Vitest sets NODE_ENV=test; the config only knows production/development.
process.env.NODE_ENV = "development";
