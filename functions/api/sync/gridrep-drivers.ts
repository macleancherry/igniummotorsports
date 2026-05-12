import { json, requireBearer, requireDb } from "../../_lib/http";
import type { Context } from "../../_lib/types";
import { getMissingGridRepConfig } from "../../_lib/gridrep";

type DriverStat = {
  iracing_customer_id: number;
  display_name: string;
  last_seen_at: string | null;
  total_sessions: number;
  latest_session_id: string | null;
  latest_series: string | null;
  latest_track: string | null;
  latest_finish_position: number | null;
  best_finish_position: number | null;
  total_results: number;
};

export async function onRequestPost(context: Context) {
  // Require admin token for auth
  const authError = requireBearer(context, context.env.ADMIN_TOKEN);
  if (authError) return authError;

  // Validate DB binding
  const db = requireDb(context);
  if (db instanceof Response) return db;

  // Check GridRep config
  const missing = getMissingGridRepConfig(context.env);
  if (missing.length > 0) {
    return json(
      {
        ok: false,
        error: "missing_gridrep_config",
        missing,
      },
      400
    );
  }

  try {
    // Get all active drivers with iRacing IDs from Ignium
    const driverQuery = await db
      .prepare(
        `SELECT id, name, iracing_customer_id FROM drivers 
         WHERE active = 1 AND iracing_customer_id IS NOT NULL`
      )
      .all();

    const driverRows = (driverQuery.results ?? []) as {
      id: number;
      name: string;
      iracing_customer_id: number;
    }[];

    if (!driverRows.length) {
      return json({ ok: true, fetched: 0, updated: 0, message: "No active drivers to sync" });
    }

    const customerIds = driverRows.map((d) => d.iracing_customer_id);

    // Call GridRep stats endpoint
    const baseUrl = (context.env.GRIDREP_API_BASE_URL ?? "").replace(/\/$/, "");
    const gridrepUrl = `${baseUrl}/api/integrations/ignium/drivers-stats?customerIds=${customerIds.join(
      ","
    )}&limit=100`;

    const gridrepResponse = await fetch(gridrepUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${context.env.GRIDREP_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!gridrepResponse.ok) {
      return json(
        {
          ok: false,
          error: "gridrep_sync_failed",
          status: gridrepResponse.status,
          message: await gridrepResponse.text(),
        },
        500
      );
    }

    const gridrepData = (await gridrepResponse.json()) as { ok?: boolean; drivers?: DriverStat[] };
    const stats = gridrepData.drivers ?? [];

    // Update Ignium drivers with stats
    let updated = 0;
    const now = new Date().toISOString();
    const warnings: string[] = [];

    for (const stat of stats) {
      const driver = driverRows.find((d) => d.iracing_customer_id === stat.iracing_customer_id);
      if (!driver) {
        warnings.push(`No local driver found for customerId ${stat.iracing_customer_id}`);
        continue;
      }

      try {
        await db
          .prepare(
            `UPDATE drivers SET
             last_seen_at = ?,
             total_sessions = ?,
             latest_series = ?,
             latest_track = ?,
             latest_finish_position = ?,
             best_finish_position = ?,
             total_results = ?,
             gridrep_synced_at = ?
             WHERE id = ?`
          )
          .bind(
            stat.last_seen_at,
            stat.total_sessions,
            stat.latest_series,
            stat.latest_track,
            stat.latest_finish_position,
            stat.best_finish_position,
            stat.total_results,
            now,
            driver.id
          )
          .run();

        updated++;
      } catch (err) {
        warnings.push(`Failed to update driver ${driver.id}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    return json({
      ok: true,
      fetched: stats.length,
      updated,
      warnings: warnings.length > 0 ? warnings : undefined,
      timestamp: now,
    });
  } catch (err) {
    return json(
      {
        ok: false,
        error: "sync_error",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      500
    );
  }
}
