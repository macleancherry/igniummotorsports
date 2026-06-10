import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDrivers, getLive, getNews, getResults } from "../lib/api";
import type { Driver, LiveEvent, NewsPost, ResultRow } from "../lib/types";

function formatDriverName(name: string): { first: string; last: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { first: "Driver", last: "Unknown" };
  }
  if (parts.length === 1) {
    return { first: parts[0], last: "" };
  }
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export function HomePage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [liveEvent, setLiveEvent] = useState<LiveEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([getDrivers(), getNews(), getResults(), getLive()])
      .then(([driversData, newsData, resultsData, liveData]) => {
        if (!mounted) return;

        setDrivers(driversData.slice(0, 8));
        setNews(newsData.slice(0, 3));
        setResults(resultsData.slice(0, 5));
        setLiveEvent(liveData.event);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load home data.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const displayDrivers = useMemo(() => drivers.slice(0, 8), [drivers]);

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
              <span className="blue">Peace</span>
              <span>through</span>
              <span>Strength 🚀</span>
            </h1>
            <p className="hero-subtitle">Ignium Motorsport competes on three core values: Hard Work, Dedication, and Positivity. We race with discipline, integrity, and the drive to excel.</p>
            <div className="button-row">
              <Link className="button-primary" to="/live">Open Live Race Control</Link>
              <Link className="button-secondary" to="/drivers">Meet the Drivers</Link>
            </div>
          </div>

          <aside className="next-race-card">
            <div className="eyebrow">Next race</div>
            <h3>{liveEvent?.series ?? "Six Hours of The Glen"}</h3>
            <p>{liveEvent?.track ?? "Watkins Glen International"}</p>
            <svg className="track-outline" viewBox="0 0 200 150" fill="none" aria-label="Watkins Glen track layout">
              {/* Watkins Glen International – full Boot layout */}
              <path
                d="M 14,138 L 96,138 Q 112,138 116,124 Q 120,112 110,100 Q 100,88 104,76 Q 108,64 120,58 Q 132,52 148,56 Q 162,60 164,76 Q 166,88 156,94 Q 160,92 172,106 Q 182,118 176,130 Q 170,140 156,136 Q 142,132 136,118 Q 110,112 72,124 Q 44,130 14,138 Z"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="3.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Start/finish line marker */}
              <line x1="55" y1="134" x2="55" y2="142" stroke="rgba(0,184,248,0.9)" strokeWidth="2.5" />
            </svg>
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

      <section className="section drivers-section">
        <div className="page-shell">
          <div className="section-header">
            <h2>Drivers</h2>
            <div className="eyebrow">The Team</div>
          </div>

          <div className="driver-grid">
            {displayDrivers.map((driver) => {
              const name = formatDriverName(driver.name);
              return (
                <Link key={driver.id} className="driver-card" to={`/drivers/${driver.slug}`}>
                  <div className="driver-number-watermark">{driver.raceNumber ?? "--"}</div>

                  {driver.avatarUrl ? (
                    <img className="driver-image" src={driver.avatarUrl} alt={driver.name} />
                  ) : null}

                  <div className="driver-info">
                    <h3>
                      {name.first}
                      <span className="surname">{name.last}</span>
                    </h3>
                    <div className="driver-race-number">{driver.raceNumber ?? "--"}</div>
                    <div className="driver-meta">
                      <span>{driver.country ?? "PRO"}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="button-row" style={{ justifyContent: "center" }}>
            <Link className="button-ghost" to="/drivers">View All Drivers</Link>
          </div>
        </div>
      </section>

      <section className="live-race-control">
        <div className="page-shell">
          <div className="live-panel">
            <div>
              <h2>
                Live <span>Race Control</span>
              </h2>
              <p>Follow every lap, every move, every moment. Live timing, telemetry and race control.</p>
              <div className="button-row">
                <Link className="button-primary" to="/live">Open Live Race Control</Link>
              </div>
            </div>

            <div>
              <div className="live-indicator">Live</div>
              <div className="timing-table-wrap" style={{ marginTop: 14 }}>
                <table className="timing-table">
                  <thead>
                    <tr>
                      <th>Pos</th>
                      <th>Driver</th>
                      <th>Series</th>
                      <th>Track</th>
                      <th>Finish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, index) => (
                      <tr key={row.id}>
                        <td>{index + 1}</td>
                        <td>{row.driverName ?? "Unknown"}</td>
                        <td>{row.series ?? "GT3"}</td>
                        <td>{row.track ?? "Watkins Glen"}</td>
                        <td>P{row.finishPosition ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                <Link to="/drivers">Drivers</Link>
                <Link to="/results">Results</Link>
                <Link to="/live">Live Race Control</Link>
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
            <span>Privacy Policy • Terms of Use • Contact</span>
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
