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
        <p className="kicker">iRacing Endurance Team</p>
        <h1>Ignium Motorsport</h1>
        <p>
          Results-driven sim racing built on consistency, preparation and race control discipline.
        </p>
        <Link className="btn-primary" to="/live">
          Live Race Control
        </Link>
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
          <h2>Featured drivers</h2>
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
          <h2>Latest news</h2>
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
          <h2>Recent results</h2>
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
