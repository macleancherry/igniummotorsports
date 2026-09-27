/**
 * Ignium Motorsport sponsors & partners.
 *
 * Plain hand-edited list — no database, no build step. Replace the example
 * entry below with real sponsors/partners as they come on board.
 *
 * Shape:
 *   {
 *     name: string;     // Sponsor/partner name
 *     logoUrl?: string; // Path to a logo in /public (optional)
 *     url?: string;     // Sponsor's website (optional)
 *     tier?: string;    // e.g. "Title Sponsor", "Partner" (optional)
 *   }
 */
export type Sponsor = {
  name: string;
  logoUrl?: string;
  url?: string;
  tier?: string;
};

export const sponsors: Sponsor[] = [
  {
    name: "Sponsor Name",
    tier: "Example Placeholder",
  },
];
