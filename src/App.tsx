import { useEffect } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
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
        const adminToken = sessionStorage.getItem("admin_token");
        if (!adminToken) return; // Only sync if admin token is available
        
        const response = await fetch("/api/sync/gridrep-drivers", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${adminToken}`,
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
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          <img className="brand-logo" src="/ignium-wordmark.svg" alt="Ignium Motorsport" />
          <span className="brand-text">
            <small>Race Control Platform</small>
          </span>
        </Link>
        <nav className="top-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "is-active" : "")} end={item.to === "/"}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="main-content">
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
  );
}
