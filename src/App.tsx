import { useEffect } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import { CacheProvider } from "./lib/cache-context";
import { AboutPage } from "./pages/AboutPage";
import { DriverProfilePage } from "./pages/DriverProfilePage";
import { DriversPage } from "./pages/DriversPage";
import { HomePage } from "./pages/HomePage";
import { LivePage } from "./pages/LivePage";
import { NewsArticlePage } from "./pages/NewsArticlePage";
import { NewsPage } from "./pages/NewsPage";
import { ResultsPage } from "./pages/ResultsPage";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/news", label: "News" },
  { to: "/drivers", label: "Drivers" },
  { to: "/results", label: "Results" },
  { to: "/live", label: "Live Race Control" },
];

export default function App() {
  // Sync driver stats from GridRep on each page load
  useEffect(() => {
    const syncDriverStats = async () => {
      try {
        const response = await fetch("/api/sync/gridrep-drivers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.ok) {
            console.log(`✓ Driver stats synced: ${data.updated} updated`);
          }
        }
      } catch (err) {
        // Silently fail - don't interrupt page load
        console.debug("Driver stats sync skipped:", err instanceof Error ? err.message : "Unknown error");
      }
    };
    
    syncDriverStats();
  }, []);

  return (
    <CacheProvider>
      <div className="app-root">
        <header className="site-header">
          <div className="site-header-inner">
            <Link className="logo-lockup" to="/">
              <img src="/ignium-wordmark.svg" alt="Ignium Motorsport" />
            </Link>

            <nav className="site-nav" aria-label="Main navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => {
                    const classes = [isActive ? "active" : ""];
                    if (item.to === "/live") classes.push("live-nav-link");
                    return classes.join(" ").trim();
                  }}
                  end={item.to === "/"}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:slug" element={<NewsArticlePage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/drivers/:slug" element={<DriverProfilePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/live" element={<LivePage />} />
          </Routes>
        </main>
      </div>
    </CacheProvider>
  );
}
