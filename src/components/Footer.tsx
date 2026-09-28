import { Link } from "react-router-dom";
import { SocialLinksList } from "./SocialLinksList";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell">
        <div className="footer-grid">
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
          </div>

          <div>
            <h4>Socials</h4>
            <SocialLinksList className="footer-socials" />
          </div>

          <div className="footer-legal">
            <h4>Legal</h4>
            <p>2026 Ignium Motorsport. All rights reserved.</p>
            <p>
              Privacy Policy · Terms of Use · <Link to="/contact">Contact</Link>
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <img src="/ignium-wordmark.svg" alt="Ignium Motorsport" />
        </div>
      </div>
    </footer>
  );
}
