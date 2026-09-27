/**
 * Ignium Motorsport driver roster.
 *
 * Plain hand-edited list — no database, no build step. To add, remove, or
 * update a driver, just edit the array below.
 *
 * Shape:
 *   {
 *     name: string;        // Full name as it should display
 *     raceNumber?: string; // Car number, e.g. "23" (optional)
 *     carClass?: string;   // e.g. "GT3", "LMP2" (optional)
 *   }
 */
export type RosterMember = {
  name: string;
  raceNumber?: string;
  carClass?: string;
};

export const roster: RosterMember[] = [
  { name: "Brad Benigfield" },
  { name: "Chris Young" },
  { name: "Daniel Barrett" },
  { name: "Dawid Melnarowicz" },
  { name: "Edward Knight" },
  { name: "Ginger Slavenburg" },
  { name: "Håkon Grebstad" },
  { name: "Jaco Boshoff" },
  { name: "Joel Farley" },
  { name: "John Buwalda" },
  { name: "Krzysztof Borys" },
  { name: "Mac Cherry" },
  { name: "Martin Dalsrud" },
  { name: "Matt B" },
  { name: "Mike Ninkranz" },
  { name: "Neil Stephenson" },
  { name: "Ryan Hirons" },
  { name: "Sam Bolen" },
  { name: "Simon Whitten" },
  { name: "Steve Norman" },
];
