import { Link, NavLink, Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Garage61Badge } from "./components/Garage61Badge";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { NewsArticlePage } from "./pages/NewsArticlePage";
import { NewsPage } from "./pages/NewsPage";
import { ResultsPage } from "./pages/ResultsPage";
import { ShopPage } from "./pages/ShopPage";
import { SponsorsPage } from "./pages/SponsorsPage";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/news", label: "News" },
  { to: "/results", label: "Results" },
  { to: "/sponsors", label: "Sponsors" },
  { to: "/shop", label: "Shop" },
  { to: "/contact", label: "Contact" },
];

export default function App() {
  return (
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
                className={({ isActive }) => (isActive ? "active" : "")}
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Garage61Badge />
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsArticlePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/sponsors" element={<SponsorsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
