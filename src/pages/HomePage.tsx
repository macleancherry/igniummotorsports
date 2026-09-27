import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNews } from "../lib/api";
import { championships } from "../data/championships";
import { results } from "../data/results";
import type { NewsPost } from "../lib/types";

export function HomePage() {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getNews()
      .then((newsData) => {
        if (!mounted) return;
        setNews(newsData.slice(0, 3));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load home data.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const recentResults = results.slice(0, 3);

  return (
    <>
      <section
        className="hero"
        style={{ "--hero-image": "url('/assets/ignium-hero-car.png')" } as React.CSSProperties}
      >
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">iRacing Endurance Team</div>
            <h1 className="hero-title">
              <span className="blue">Ignite</span>
              <span>Your</span>
              <span>Passion</span>
            </h1>
            <p className="hero-subtitle">Ignium Motorsport competes on three core values: Hard Work, Dedication, and Positivity. We race with discipline, integrity, and the drive to excel.</p>
            <div className="button-row">
              <Link className="button-primary" to="/results">View Results</Link>
              <Link className="button-secondary" to="/about">Meet the Team</Link>
            </div>
          </div>

          <aside className="next-race-card">
            <div className="eyebrow">Currently Racing In</div>
            <h3>{championships[0]?.name ?? "See our championships"}</h3>
            <p>
              <Link to="/championships">View all championships &amp; ladders</Link>
            </p>
          </aside>
        </div>
      </section>

      <section className="section team-intro">
        <div className="page-shell">
          <div className="team-intro-grid">
            <div>
              <h2>
                Team <span className="text-blue">Ignium</span>
              </h2>
              <p>
                Ignium Motorsport is an iRacing endurance racing team built on three core morals: hard work,
                dedication, and positivity. We're committed to continuous improvement, professional conduct,
                and bringing passion to every lap.
              </p>
              <p>
                We believe that by living these three morals, Ignium has the potential to excel and inspire others.
                We look forward to the journey.
              </p>
            </div>

            <div className="telemetry-map">
              <div className="telemetry-stats">
                <div className="telemetry-stat"><span>Practice</span><strong>Disciplined preparation and continuous improvement</strong></div>
                <div className="telemetry-stat"><span>Conduct</span><strong>Professional, sportsmanlike racing always</strong></div>
                <div className="telemetry-stat"><span>Growth</span><strong>Learn from every race, positive and negative</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section compact values-section">
        <div className="page-shell">
          <h3 className="values-title">Built On More Than Pace</h3>
          <div className="value-grid">
            <article className="value-card">
              <div className="value-icon">🔨</div>
              <div>
                <h3>Hard Work</h3>
                <p>We invest the time and effort needed to improve ourselves and strengthen our team. There are no shortcuts to excellence.</p>
              </div>
            </article>

            <article className="value-card">
              <div className="value-icon">💪</div>
              <div>
                <h3>Dedication</h3>
                <p>Our commitment to professional, sportsmanlike conduct protects both our reputation and the integrity of every race.</p>
              </div>
            </article>

            <article className="value-card">
              <div className="value-icon">⚡</div>
              <div>
                <h3>Positivity</h3>
                <p>Wins and losses are both opportunities to learn. We transform setbacks into fuel for improvement and drive forward stronger.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div className="section-header">
            <h3>Recent Results</h3>
            <Link className="button-ghost" to="/results">All Results</Link>
          </div>
          <div className="news-grid">
            {recentResults.map((result) => (
              <article key={result.id} className="news-card">
                <div className="news-meta">{result.series}</div>
                <h3>{result.track}</h3>
                <p>{result.finish ?? result.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div className="section-header">
            <h3>Latest News</h3>
            <Link className="button-ghost" to="/news">All News</Link>
          </div>
          <div className="news-grid">
            {news.map((post) => (
              <article key={post.id} className="news-card">
                <div className="news-meta">Ignium Update</div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

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
                <Link to="/championships">Championships</Link>
                <Link to="/results">Results</Link>
                <Link to="/sponsors">Sponsors</Link>
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

      {error ? (
        <section className="section compact">
          <div className="page-shell">
            <div className="empty-state">
              <h3>Data Loading Notice</h3>
              <p>{error}</p>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
