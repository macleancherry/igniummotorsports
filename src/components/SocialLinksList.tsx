import { socialLinks } from "../lib/social-links";

export function SocialLinksList({ className = "social-links-list" }: { className?: string }) {
  return (
    <ul className={className}>
      {socialLinks.map((link) => (
        <li key={link.platform}>
          <span className="platform">{link.platform}</span>
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            {link.handle} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}
