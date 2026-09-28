/**
 * Ignium Motorsport "Follow The Team" social grid.
 *
 * Plain hand-edited list standing in for a real Instagram feed — there is no
 * live Instagram API integration. Entries below reuse existing local
 * Instagram-recap photos as PLACEHOLDERS. Swap `imageUrl` to real exported
 * Instagram images and `url` to the actual post permalink as they become
 * available.
 *
 * Shape:
 *   {
 *     id: string;         // stable key
 *     imageUrl: string;   // path to a square-ish image in /public
 *     caption?: string;   // alt text / accessible caption (optional)
 *     url?: string;       // link-out to the Instagram post (optional)
 *   }
 */
export type SocialPost = {
  id: string;
  imageUrl: string;
  caption?: string;
  url?: string;
};

const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/ignium_motorsport/";

export const socialPosts: SocialPost[] = [
  { id: "1", imageUrl: "/news-covers/instagram-are-you-ready-march-2025.jpg", caption: "Are you ready — March 2025", url: INSTAGRAM_PROFILE_URL },
  { id: "2", imageUrl: "/news-covers/instagram-bart-marotel-4k-irating.jpg", caption: "Bart Marotel hits 4K iRating", url: INSTAGRAM_PROFILE_URL },
  { id: "3", imageUrl: "/news-covers/instagram-luke-jones-p2-spa.jpg", caption: "Luke Jones P2 at Spa", url: INSTAGRAM_PROFILE_URL },
  { id: "4", imageUrl: "/news-covers/instagram-motegi-get-series-p3.webp", caption: "GET Series P3 at Motegi", url: INSTAGRAM_PROFILE_URL },
  { id: "5", imageUrl: "/news-covers/instagram-p2-petit-lemans-2025.jpg", caption: "P2 at Petit Le Mans 2025", url: INSTAGRAM_PROFILE_URL },
  { id: "6", imageUrl: "/news-covers/instagram-roar-before-24-driver-lineup.jpg", caption: "Roar Before the 24 driver lineup", url: INSTAGRAM_PROFILE_URL },
  { id: "7", imageUrl: "/news-covers/instagram-sergio-daytona-tcr-victory.jpg", caption: "Sergio's Daytona TCR victory", url: INSTAGRAM_PROFILE_URL },
  { id: "8", imageUrl: "/news-covers/instagram-sergio-ferreira-season-4-recognition.jpg", caption: "Sergio Ferreira season 4 recognition", url: INSTAGRAM_PROFILE_URL },
  // Filler placeholder only — not a real Instagram post; swap out first once a real export exists.
  { id: "9", imageUrl: "/assets/ignium-hero-car.png", caption: "Ignium Motorsport", url: INSTAGRAM_PROFILE_URL },
];
