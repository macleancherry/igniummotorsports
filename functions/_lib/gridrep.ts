import type { Env } from "./types";

export type GridRepResult = {
  customerId: number | null;
  driverName: string | null;
  subsessionId: string | null;
  sessionName: string | null;
  series: string | null;
  track: string | null;
  car: string | null;
  carClass: string | null;
  qualifyingPosition: number | null;
  startPosition: number | null;
  finishPosition: number | null;
  classPosition: number | null;
  fieldSize: number | null;
  classFieldSize: number | null;
  lapsCompleted: number | null;
  bestLap: string | null;
  incidents: number | null;
  strengthOfField: number | null;
  iratingChange: number | null;
  licenseChange: string | null;
  official: boolean | null;
  completedAt: string | null;
  resultUrl: string | null;
};

type GridRepResponse = { results?: unknown };

function parseCustomerIds(csv: string | undefined): number[] {
  if (!csv) return [];
  return csv
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((x) => Number.isFinite(x) && x > 0)
    .map((x) => Math.trunc(x));
}

function asNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asBooleanOrNull(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function normalizeResult(input: unknown): GridRepResult | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;

  return {
    customerId: asNumberOrNull(record.customerId),
    driverName: asStringOrNull(record.driverName),
    subsessionId: asStringOrNull(record.subsessionId),
    sessionName: asStringOrNull(record.sessionName),
    series: asStringOrNull(record.series),
    track: asStringOrNull(record.track),
    car: asStringOrNull(record.car),
    carClass: asStringOrNull(record.carClass),
    qualifyingPosition: asNumberOrNull(record.qualifyingPosition),
    startPosition: asNumberOrNull(record.startPosition),
    finishPosition: asNumberOrNull(record.finishPosition),
    classPosition: asNumberOrNull(record.classPosition),
    fieldSize: asNumberOrNull(record.fieldSize),
    classFieldSize: asNumberOrNull(record.classFieldSize),
    lapsCompleted: asNumberOrNull(record.lapsCompleted),
    bestLap: asStringOrNull(record.bestLap),
    incidents: asNumberOrNull(record.incidents),
    strengthOfField: asNumberOrNull(record.strengthOfField),
    iratingChange: asNumberOrNull(record.iratingChange),
    licenseChange: asStringOrNull(record.licenseChange),
    official: asBooleanOrNull(record.official),
    completedAt: asStringOrNull(record.completedAt),
    resultUrl: asStringOrNull(record.resultUrl),
  };
}

export function getMissingGridRepConfig(env: Env): string[] {
  const missing: string[] = [];
  if (!env.GRIDREP_API_BASE_URL) missing.push("GRIDREP_API_BASE_URL");
  if (!env.GRIDREP_API_TOKEN) missing.push("GRIDREP_API_TOKEN");
  if (!env.GRIDREP_TEAM_DRIVER_CUSTOMER_IDS) missing.push("GRIDREP_TEAM_DRIVER_CUSTOMER_IDS");
  return missing;
}

export async function fetchGridRepResults(env: Env, limit = 20): Promise<GridRepResult[]> {
  const customerIds = parseCustomerIds(env.GRIDREP_TEAM_DRIVER_CUSTOMER_IDS);
  const baseUrl = env.GRIDREP_API_BASE_URL?.replace(/\/$/, "") ?? "";

  const url = `${baseUrl}/api/integrations/ignium/results?customerIds=${customerIds.join(",")}&limit=${Math.max(1, Math.min(limit, 100))}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.GRIDREP_API_TOKEN}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`GridRep request failed with ${response.status}`);
  }

  const payload = (await response.json()) as GridRepResponse;
  const rows = Array.isArray(payload.results) ? payload.results : [];

  return rows
    .map(normalizeResult)
    .filter((row): row is GridRepResult => row !== null && row.subsessionId !== null);
}
