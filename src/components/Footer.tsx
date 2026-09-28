import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell">
        <div className="footer-grid">
          <div>
            <img src="/ignium-wordmark.svg" alt="Ignium Motorsport" />
            <div className="social-row">
              <a href="https://discord.gg/ignium" aria-label="Discord" target="_blank" rel="noopener noreferrer">D</a>
            </div>
          </div>

          <div>
            <h4>Navigation</h4>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/news">News</Link>
              <Link to="/results">Results</Link>
              <Link to="/sponsors">Sponsors</Link>
              <Link to="/shop">Shop</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <h4>Stay Connected</h4>
            <p>Follow us on socials for the latest news, results and behind-the-scenes updates.</p>
            <div className="footer-links" style={{ marginTop: "0.75rem" }}>
              <a href="https://discord.gg/ignium" target="_blank" rel="noopener noreferrer">Discord</a>
              <a href="https://www.instagram.com/ignium_motorsport" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.youtube.com/@igniummotorsport" target="_blank" rel="noopener noreferrer">YouTube</a>
              <a href="https://www.twitch.tv/igniumotorsport" target="_blank" rel="noopener noreferrer">Twitch</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>2026 Ignium Motorsport. All rights reserved.</span>
          <span>
            Privacy Policy • Terms of Use • <Link to="/contact">Contact</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
