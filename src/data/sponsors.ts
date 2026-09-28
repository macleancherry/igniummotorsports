/**
 * Ignium Motorsport sponsors & partners.
 *
 * Plain hand-edited list — no database, no build step. Add a new entry as
 * sponsors come on board.
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
    name: "Delta Racewear",
    logoUrl: "/assets/delta-racewear-logo.png",
    url: "https://deltaracewear.com/",
    tier: "Partner",
  },
  {
    name: "Pimax",
    logoUrl: "/assets/pimax-logo.png",
    url: "https://au.pimax.com/pages/pimax-ambassadors",
    tier: "Partner",
  },
];
