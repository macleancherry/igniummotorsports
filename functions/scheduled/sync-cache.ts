/**
 * Scheduled Worker: Hourly sync of driver and result data from GridRep
 * Triggered by cron: 0 * * * * (hourly at minute 0)
 * 
 * This worker:
 * 1. Calls /api/sync/gridrep-drivers to sync driver stats
 * 2. Calls /api/sync/gridrep-results to sync race results
 * 3. Updates cached_at timestamps on all tables
 * 
 * Result: Frontend always has fresh data cached in D1, loads instantly
 */

import type { ScheduledEvent } from "@cloudflare/workers-types";

export default {
  async scheduled(event: ScheduledEvent, env: CloudflareEnv, ctx: ExecutionContext) {
    ctx.waitUntil(syncCache(event, env));
  },
};

async function syncCache(event: ScheduledEvent, env: CloudflareEnv) {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting scheduled cache sync...`);

  try {
    // Build the origin URL for API calls
    const origin = "https://igniummotorsports.pages.dev";

    // Call the two sync endpoints to refresh data in D1
    const [driversRes, resultsRes] = await Promise.allSettled([
      fetch(`${origin}/api/sync/gridrep-drivers`, { method: "POST" }).catch((err) => ({
        ok: false,
        error: err.message,
      })),
      fetch(`${origin}/api/sync/gridrep-results`, { method: "POST" }).catch((err) => ({
        ok: false,
        error: err.message,
      })),
    ]);

    const driversSyncOk =
      driversRes.status === "fulfilled" && driversRes.value instanceof Response ? driversRes.value.ok : false;
    const resultsSyncOk =
      resultsRes.status === "fulfilled" && resultsRes.value instanceof Response ? resultsRes.value.ok : false;

    const duration = Date.now() - startTime;
    const status = driversSyncOk && resultsSyncOk ? "✓ Success" : "⚠ Partial";

    console.log(
      `[${new Date().toISOString()}] Sync complete (${duration}ms): drivers=${driversSyncOk}, results=${resultsSyncOk}`
    );

    // Update cached_at for all tables (mark as freshly cached)
    if (env.DB && driversSyncOk) {
      try {
        await env.DB.prepare("UPDATE drivers SET cached_at = datetime('now') WHERE cached_at IS NOT NULL").run();
        await env.DB.prepare("UPDATE results SET cached_at = datetime('now') WHERE cached_at IS NOT NULL").run();
        console.log(`[${new Date().toISOString()}] Updated cached_at timestamps`);
      } catch (e) {
        console.warn(`[${new Date().toISOString()}] Failed to update timestamps:`, e);
      }
    }

    return {
      status,
      duration,
      driversSyncOk,
      resultsSyncOk,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Sync failed after ${duration}ms:`, error);

    return {
      status: "✗ Error",
      duration,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Type stub for Cloudflare environment
interface CloudflareEnv {
  DB: D1Database;
  ENVIRONMENT?: "production" | "development";
}

interface D1Database {
  prepare(sql: string): {
    run(): Promise<{ success: boolean }>;
  };
}
