/**
 * Championships & ladders Ignium Motorsport drivers currently compete in.
 *
 * Plain hand-edited list — no database, no build step. Replace the example
 * entries below with the real series/leagues your drivers are racing in.
 *
 * Shape:
 *   {
 *     name: string;         // Series/league/ladder name
 *     description?: string; // One line about it (optional)
 *     url?: string;         // Link to the series' own site/standings (optional)
 *   }
 */
export type Championship = {
  name: string;
  description?: string;
  url?: string;
};

export const championships: Championship[] = [
  {
    name: "Example: IMSA Endurance Series (iRacing)",
    description: "Placeholder entry — replace with a real series Ignium drivers are currently competing in.",
  },
  {
    name: "Example: GT3 Sprint Series",
    description: "Placeholder entry — replace with a real series Ignium drivers are currently competing in.",
  },
];
