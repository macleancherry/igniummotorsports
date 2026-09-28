import type { ManualResult } from "../data/results";

export type ParsedFinish = {
  overall: number;
  inClass: number | null;
};

/**
 * Best-effort parse of a free-text `finish` string into structured
 * position data. Matches the "P<n>" / "P<n> (P<n> in class)" convention
 * documented in src/data/results.ts. Returns null when the text doesn't
 * match that shape, so callers can fall back to rendering it as-is.
 */
export function parseFinish(finish: string | undefined): ParsedFinish | null {
  if (!finish) return null;
  const match = finish.match(/P(\d+)(?:\s*\(P(\d+)\s+in class\))?/i);
  if (!match) return null;
  return {
    overall: Number(match[1]),
    inClass: match[2] ? Number(match[2]) : null,
  };
}

export function isPodium(finish: string | undefined): boolean {
  const parsed = parseFinish(finish);
  return parsed !== null && parsed.overall <= 3;
}

export function formatResultDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function sortResultsByDateDesc(results: ManualResult[]): ManualResult[] {
  return [...results].sort((a, b) => b.date.localeCompare(a.date));
}
