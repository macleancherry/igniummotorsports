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
          <h1>Ignite Your PASSION</h1>
          <p>
            Ignium Motorsport competes on three core values: Hard Work, Dedication, and Positivity.
            We race with discipline, integrity, and the drive to excel.
          </p>
          <div className="link-row">
            <Link className="btn-primary" to="/live">
              Open Live Race Control
            </Link>
            <Link className="btn-ghost" to="/about">
              Learn Our Values
            </Link>
          </div>
        </div>
        <aside className="hero-aside">
          <p className="kicker">What We Do</p>
          <p><strong>Practice:</strong> Disciplined preparation and continuous improvement</p>
          <p><strong>Conduct:</strong> Professional, sportsmanlike racing always</p>
          <p><strong>Growth:</strong> Learn from every race, positive and negative</p>
        </aside>
      </section>

      <section className="values-highlight">
        <div className="value-highlight-card">
          <span className="value-icon">🔨</span>
          <h3>Hard Work</h3>
          <p>We invest the practice needed to excel</p>
        </div>
        <div className="value-highlight-card">
          <span className="value-icon">💪</span>
          <h3>Dedication</h3>
          <p>We maintain professional standards always</p>
        </div>
        <div className="value-highlight-card">
          <span className="value-icon">⚡</span>
          <h3>Positivity</h3>
          <p>We turn adversity into fuel for improvement</p>
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
