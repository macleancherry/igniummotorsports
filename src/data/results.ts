/**
 * Ignium Motorsport race results.
 *
 * Plain hand-edited list — no database, no build step. Add a new entry for
 * each race; either fill in the details directly, or just link out to the
 * team's Instagram recap post.
 *
 * Shape:
 *   {
 *     id: string;            // Any unique string, e.g. "2026-03-glen"
 *     date: string;          // ISO date, e.g. "2026-03-28"
 *     series: string;        // Series/championship name
 *     track: string;         // Track name
 *     finish?: string;       // e.g. "P7 (P5 in class)" (optional)
 *     note?: string;         // Short blurb (optional)
 *     instagramUrl?: string; // Link to the Instagram recap post (optional)
 *   }
 */
export type ManualResult = {
  id: string;
  date: string;
  series: string;
  track: string;
  finish?: string;
  note?: string;
  instagramUrl?: string;
};

export const results: ManualResult[] = [
  {
    id: "example-result",
    date: "2026-03-28",
    series: "Example: IMSA Endurance Series",
    track: "Example: Long Beach",
    finish: "P7 (P5 in class)",
    note: "Placeholder entry — replace with a real race result, or link to the Instagram recap.",
  },
];
