import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/schema";

// The neon-http driver's fetch has no built-in timeout — an occasional
// stalled connection to Neon would otherwise hang the calling request (and
// the client's "Logging in..." spinner) forever. Give every query call a
// hard ceiling so a stall surfaces as a fast, visible error instead.
const QUERY_TIMEOUT_MS = 10_000;

neonConfig.fetchFunction = (input: RequestInfo | URL, init?: RequestInit) => {
  return fetch(input, { ...init, signal: AbortSignal.timeout(QUERY_TIMEOUT_MS) });
};

// Lazy init: `next build` evaluates top-level module code even before
// DATABASE_URL is configured (e.g. first deploy) — calling neon() eagerly
// would crash the build.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL!);
    _db = drizzle(sql, { schema });
  }
  return _db;
}
