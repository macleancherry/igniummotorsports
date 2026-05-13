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
        <div className="hero-copy">
          <p className="kicker">Ignium Motorsport</p>
          <h1>Fast, calm, and built like a real garage.</h1>
          <p className="hero-lead">
            A racing team site should feel like a paddock, not a dashboard. This is a softer, cleaner home for
            the team story, live race control, results, and drivers.
          </p>
          <div className="hero-points">
            <span>Endurance pace</span>
            <span>Clean racecraft</span>
            <span>Good energy</span>
          </div>
          <div className="link-row">
            <Link className="btn-primary" to="/live">
              Live race control
            </Link>
            <Link className="btn-ghost" to="/results">
              Recent results
            </Link>
          </div>
        </div>

        <aside className="hero-aside">
          <p className="eyebrow">Race week</p>
          <div className="aside-block aside-block-primary">
            <span className="aside-label">Current status</span>
            <strong>{liveEvent ? liveEvent.status.toUpperCase() : "PREPARING"}</strong>
            <p>{liveEvent ? liveEvent.title : "Building toward the next session."}</p>
          </div>
          <div className="aside-block-grid">
            <div className="aside-block">
              <span className="aside-label">Drivers</span>
              <strong>{drivers.length}</strong>
            </div>
            <div className="aside-block">
              <span className="aside-label">News</span>
              <strong>{news.length}</strong>
            </div>
            <div className="aside-block">
              <span className="aside-label">Results</span>
              <strong>{results.length}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="values-highlight values-highlight-soft">
        <div className="value-highlight-card">
          <span className="value-icon">01</span>
          <h3>Preparation</h3>
          <p>Every stint starts before the green flag.</p>
        </div>
        <div className="value-highlight-card">
          <span className="value-icon">02</span>
          <h3>Composure</h3>
          <p>Traffic, weather, and pressure stay manageable.</p>
        </div>
        <div className="value-highlight-card">
          <span className="value-icon">03</span>
          <h3>Team feel</h3>
          <p>Serious about pace, never stiff about the sport.</p>
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
          <h2>Drivers</h2>
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
