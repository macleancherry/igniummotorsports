/**
 * Ignium Motorsport's next scheduled race, for the Timing Strip.
 *
 * Plain hand-edited placeholder — no calendar integration exists. Update
 * `nextRace` as races are scheduled, or set it to `null` for the off-season
 * fallback message. Set `live: true` while a race is actually underway.
 *
 * Shape:
 *   {
 *     id: string;            // stable key
 *     seriesLabel: string;   // e.g. "IMSA Endurance Series"
 *     event: string;         // e.g. "6 Hours of Watkins Glen"
 *     startTime: string;     // ISO 8601 date-time
 *     watchUrl?: string;     // link to a stream/broadcast (optional)
 *     watchLabel?: string;   // e.g. "Twitch" (optional, paired with watchUrl)
 *     live: boolean;         // true while the race is currently running
 *   }
 */
export type UpcomingRace = {
  id: string;
  seriesLabel: string;
  event: string;
  startTime: string;
  watchUrl?: string;
  watchLabel?: string;
  live: boolean;
};

// Example entry — replace with the team's actual next scheduled race.
export const nextRace: UpcomingRace | null = {
  id: "example-1",
  seriesLabel: "IMSA Endurance Series",
  event: "6 Hours of Watkins Glen",
  startTime: "2026-11-14T19:00:00Z",
  watchUrl: "https://www.twitch.tv/igniumotorsport",
  watchLabel: "Twitch",
  live: false,
};
