import { Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { TimingStrip } from "./components/TimingStrip";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { NewsArticlePage } from "./pages/NewsArticlePage";
import { NewsPage } from "./pages/NewsPage";
import { ResultsPage } from "./pages/ResultsPage";
import { ShopPage } from "./pages/ShopPage";
import { SponsorsPage } from "./pages/SponsorsPage";
import { StyleguidePage } from "./pages/StyleguidePage";

export default function App() {
  return (
    <div className="app-root">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <TimingStrip />
      <Header />

      <main id="main-content" className="app-main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsArticlePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/sponsors" element={<SponsorsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/styleguide" element={<StyleguidePage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
