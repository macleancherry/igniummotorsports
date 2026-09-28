import { Fragment, useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/news", label: "News" },
  { to: "/results", label: "Results" },
  { to: "/sponsors", label: "Sponsors" },
  { to: "/shop", label: "Shop" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [isCondensed, setIsCondensed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setIsMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setIsCondensed(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <Fragment>
      <header className={`site-header${isCondensed ? " is-condensed" : ""}`}>
        <div className="site-header-inner">
          <Link className="logo-lockup" to="/">
            <img src="/ignium-wordmark.svg" alt="Ignium Motorsport" />
          </Link>

          <nav className="site-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? "active" : "")}
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className="mobile-menu-toggle-bars" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      <div id="mobile-menu" className={`mobile-menu${isMenuOpen ? " is-open" : ""}`}>
        <button
          type="button"
          className="mobile-menu-close"
          aria-label="Close menu"
          onClick={() => setIsMenuOpen(false)}
        >
          Close
        </button>
        <nav className="mobile-menu-list" aria-label="Mobile navigation">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "active" : "")}
              end={item.to === "/"}
              style={{ "--i": index } as React.CSSProperties}
              tabIndex={isMenuOpen ? undefined : -1}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </Fragment>
  );
}
