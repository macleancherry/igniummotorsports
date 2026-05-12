import { fetchGridRepResults, getMissingGridRepConfig } from "../../_lib/gridrep";
import { json, requireBearer } from "../../_lib/http";
import type { Context } from "../../_lib/types";

export async function onRequestPost(context: Context) {
  const authError = requireBearer(context, context.env.ADMIN_TOKEN);
  if (authError) return authError;

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

  const warnings: string[] = [];
  const fetchedRows = await fetchGridRepResults(context.env, 20);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of fetchedRows) {
    if (!row.subsessionId || row.customerId === null) {
      skipped += 1;
      warnings.push("Skipped a row missing subsessionId or customerId.");
      continue;
    }

    const sourceResultId = `${row.subsessionId}:${row.customerId}`;

    const driver = await context.env.DB.prepare(
      `SELECT id, name FROM drivers WHERE iracing_customer_id = ?`
    )
      .bind(row.customerId)
      .first<any>();

    if (!driver) {
      skipped += 1;
      warnings.push(`No local driver for customerId ${row.customerId}.`);
      continue;
    }

    const existing = await context.env.DB.prepare(
      `SELECT id FROM results WHERE source = 'gridrep' AND source_result_id = ?`
    )
      .bind(sourceResultId)
      .first<any>();

    const now = new Date().toISOString();

    if (existing?.id) {
      await context.env.DB.prepare(
        `UPDATE results
         SET driver_id = ?,
             iracing_customer_id = ?,
             subsession_id = ?,
             driver_name = ?,
             team_name = COALESCE(team_name, ?),
             series = ?,
             track = ?,
             car = ?,
             car_class = ?,
             qualifying_position = ?,
             start_position = ?,
             finish_position = ?,
             class_position = ?,
             field_size = ?,
             class_field_size = ?,
             laps_completed = ?,
             best_lap = ?,
             incidents = ?,
             strength_of_field = ?,
             irating_change = ?,
             license_change = ?,
             official = ?,
             result_url = ?,
             completed_at = ?,
             updated_at = ?
         WHERE id = ?`
      )
        .bind(
          driver.id,
          row.customerId,
          row.subsessionId,
          row.driverName ?? driver.name,
          "Ignium Motorsport",
          row.series,
          row.track,
          row.car,
          row.carClass,
          row.qualifyingPosition,
          row.startPosition,
          row.finishPosition,
          row.classPosition,
          row.fieldSize,
          row.classFieldSize,
          row.lapsCompleted,
          row.bestLap,
          row.incidents,
          row.strengthOfField,
          row.iratingChange,
          row.licenseChange,
          row.official === null ? null : row.official ? 1 : 0,
          row.resultUrl,
          row.completedAt,
          now,
          existing.id
        )
        .run();
      updated += 1;
    } else {
      await context.env.DB.prepare(
        `INSERT INTO results (
          driver_id, source, source_result_id, iracing_customer_id, subsession_id, driver_name, team_name,
          series, track, car, car_class, qualifying_position, start_position, finish_position, class_position,
          field_size, class_field_size, laps_completed, best_lap, incidents, strength_of_field, irating_change,
          license_change, official, result_url, completed_at, updated_at
        ) VALUES (?, 'gridrep', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          driver.id,
          sourceResultId,
          row.customerId,
          row.subsessionId,
          row.driverName ?? driver.name,
          "Ignium Motorsport",
          row.series,
          row.track,
          row.car,
          row.carClass,
          row.qualifyingPosition,
          row.startPosition,
          row.finishPosition,
          row.classPosition,
          row.fieldSize,
          row.classFieldSize,
          row.lapsCompleted,
          row.bestLap,
          row.incidents,
          row.strengthOfField,
          row.iratingChange,
          row.licenseChange,
          row.official === null ? null : row.official ? 1 : 0,
          row.resultUrl,
          row.completedAt,
          now
        )
        .run();
      inserted += 1;
    }
  }

  return json({
    ok: true,
    fetched: fetchedRows.length,
    inserted,
    updated,
    skipped,
    warnings,
  });
}
