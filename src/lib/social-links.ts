export type SocialLink = {
  platform: string;
  handle: string;
  url: string;
};

export const socialLinks: SocialLink[] = [
  { platform: "Instagram", handle: "@ignium_motorsport", url: "https://www.instagram.com/ignium_motorsport" },
  { platform: "YouTube", handle: "@igniummotorsport", url: "https://www.youtube.com/@igniummotorsport" },
  { platform: "Twitch", handle: "igniumotorsport", url: "https://www.twitch.tv/igniumotorsport" },
  { platform: "Discord", handle: "Join the server", url: "https://discord.gg/ignium" },
];
