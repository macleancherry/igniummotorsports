import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDrivers, getLive, getNews, getResults } from "../lib/api";
import type { Driver, LiveEvent, NewsPost, ResultRow } from "../lib/types";

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
        setDrivers(driversData.slice(0, 3));
        setNews(newsData.slice(0, 3));
        setResults(resultsData.slice(0, 3));
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

  return (
    <div className="page-wrap">
      <section className="hero">
        <div>
          <p className="kicker">iRacing Endurance Team</p>
          <h1>Built for Endurance. Driven by Joy.</h1>
          <p>
            Ignium Motorsport is a race team first and a data platform second. We focus on clean pace,
            reliable teamwork, and a culture that keeps racing fun under pressure.
          </p>
          <div className="hero-points">
            <span>Long-run discipline</span>
            <span>Calm comms in traffic</span>
            <span>Positive team energy</span>
          </div>
          <div className="link-row">
            <Link className="btn-primary" to="/live">
              Open Live Race Control
            </Link>
            <Link className="btn-ghost" to="/about">
              Explore Team Story
            </Link>
          </div>
        </div>
        <aside className="hero-aside">
          <p className="kicker">This Week</p>
          {liveEvent ? (
            <>
              <p><strong>Live status:</strong> {liveEvent.status.toUpperCase()}</p>
              <p><strong>Session:</strong> {liveEvent.title}</p>
              <p><strong>Track:</strong> {liveEvent.track}</p>
            </>
          ) : (
            <>
              <p><strong>Training focus:</strong> racecraft and pit entry consistency</p>
              <p><strong>Car setup:</strong> stable over long stints</p>
              <p><strong>Driver brief:</strong> keep momentum, avoid forced moves</p>
            </>
          )}
          <div className="hero-stat-grid">
            <div>
              <span>Drivers</span>
              <strong>{drivers.length}</strong>
            </div>
            <div>
              <span>News</span>
              <strong>{news.length}</strong>
            </div>
            <div>
              <span>Recent Results</span>
              <strong>{results.length}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="values-highlight">
        <div className="value-highlight-card">
          <span className="value-icon">HW</span>
          <h3>Hard Work</h3>
          <p>Preparation is our competitive edge.</p>
        </div>
        <div className="value-highlight-card">
          <span className="value-icon">DD</span>
          <h3>Dedication</h3>
          <p>Professional standards in every session.</p>
        </div>
        <div className="value-highlight-card">
          <span className="value-icon">PX</span>
          <h3>Positivity</h3>
          <p>Pressure stays high, morale stays higher.</p>
        </div>
      </section>

      {liveEvent?.status === "live" && (
        <section className="panel panel-live">
          <h2>Live now</h2>
          <p>{liveEvent.title}</p>
          <p>
            {liveEvent.series} at {liveEvent.track}
          </p>
        </section>
      )}

      {error && <p className="error">{error}</p>}

      <section className="panel">
        <div className="panel-head">
          <h2>Featured Drivers</h2>
          <Link to="/drivers">View all</Link>
        </div>
        <div className="grid cards-3">
          {drivers.map((driver) => (
            <article key={driver.id} className="card">
              <h3>{driver.name}</h3>
              <p>#{driver.raceNumber ?? "-"} • {driver.country ?? "Unknown"}</p>
              <Link to={`/drivers/${driver.slug}`}>Profile</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Latest News</h2>
          <Link to="/news">All news</Link>
        </div>
        <div className="grid cards-3">
          {news.map((post) => (
            <article key={post.id} className="card">
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <Link to={`/news/${post.slug}`}>Read article</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Recent Results</h2>
          <Link to="/results">Full results</Link>
        </div>
        <div className="grid cards-3">
          {results.map((result) => (
            <article key={result.id} className="card">
              <h3>{result.series}</h3>
              <p>{result.track}</p>
              <p>Finish P{result.finishPosition ?? "-"}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
