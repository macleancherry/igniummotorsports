import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getDriver, getDriverResults } from "../lib/api";
import type { Driver, ResultRow } from "../lib/types";

export function DriverProfilePage() {
  const { slug = "" } = useParams();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getDriver(slug), getDriverResults(slug)])
      .then(([driverData, resultData]) => {
        if (!mounted) return;
        setDriver(driverData);
        setResults(resultData);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load driver profile.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <section className="section compact">
        <div className="page-shell">
          <div className="empty-state">
            <h3>Loading Driver</h3>
            <p>Fetching profile and latest results.</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section compact">
        <div className="page-shell">
          <div className="empty-state">
            <h3>Data Loading Notice</h3>
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!driver) {
    return (
      <section className="section compact">
        <div className="page-shell">
          <div className="empty-state">
            <h3>Driver Not Found</h3>
            <p>No profile data is available for this driver slug.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section compact subpage-hero">
        <div className="page-shell">
          <div className="button-row" style={{ marginTop: 0, marginBottom: 20 }}>
            <Link className="button-ghost" to="/drivers">
              Back To Drivers
            </Link>
          </div>

          <div className="panel driver-profile-head">
            {driver.avatarUrl ? (
              <img className="driver-profile-avatar" src={driver.avatarUrl} alt={driver.name} />
            ) : null}

            <div>
              <div className="eyebrow">Driver Profile</div>
              <h1 className="subpage-title">{driver.name}</h1>
              <p className="subpage-intro">#{driver.raceNumber ?? "-"} • {driver.country ?? "Unknown"}</p>
              {driver.bio ? <p>{driver.bio}</p> : null}

              <div className="button-row">
                {driver.twitchUrl ? (
                  <a className="button-secondary" href={driver.twitchUrl} target="_blank" rel="noreferrer">
                    Twitch
                  </a>
                ) : null}
                {driver.youtubeUrl ? (
                  <a className="button-secondary" href={driver.youtubeUrl} target="_blank" rel="noreferrer">
                    YouTube
                  </a>
                ) : null}
                <Link className="button-primary" to="/live">
                  Live Race Control
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div className="subpage-grid-3">
            <article className="card subpage-stat-card">
              <h3>Career Snapshot</h3>
              <p>Sessions: {driver.totalSessions ?? 0}</p>
              <p>Results tracked: {driver.totalResults ?? 0}</p>
              <p>Average finish: {driver.avgFinishPosition ?? "-"}</p>
              <p>Best finish: P{driver.bestFinishPosition ?? "-"}</p>
            </article>

            <article className="card subpage-stat-card">
              <h3>Highlights</h3>
              <p>Wins: {driver.wins ?? 0}</p>
              <p>Podiums: {driver.podiums ?? 0}</p>
              <p>Top 5s: {driver.topFives ?? 0}</p>
              <p>Favorite track: {driver.favoriteTrack ?? "-"}</p>
            </article>

            <article className="card subpage-stat-card">
              <h3>Current Form</h3>
              <p>Latest series: {driver.latestSeries ?? "-"}</p>
              <p>Latest track: {driver.latestTrack ?? "-"}</p>
              <p>Latest finish: P{driver.latestFinishPosition ?? "-"}</p>
              <p>iRating: {driver.irating ?? "-"}</p>
              <p>License: {driver.licenseClass ?? "-"}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div className="section-header">
            <h2>Recent Results</h2>
          </div>

          {results.length === 0 ? (
            <div className="empty-state">
              <h3>No Results Yet</h3>
              <p>This driver has no tracked results at the moment.</p>
            </div>
          ) : (
            <div className="timing-table-wrap">
              <table className="timing-table">
                <thead>
                  <tr>
                    <th>Series</th>
                    <th>Track</th>
                    <th>Car</th>
                    <th>Start</th>
                    <th>Finish</th>
                    <th>Class</th>
                    <th>Inc</th>
                    <th>Best Lap</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result: ResultRow) => (
                    <tr key={result.id}>
                      <td>{result.series ?? "Session"}</td>
                      <td>{result.track ?? "-"}</td>
                      <td>{result.car ?? "-"}</td>
                      <td>P{result.startPosition ?? "-"}</td>
                      <td>P{result.finishPosition ?? "-"}</td>
                      <td>P{result.classPosition ?? "-"}</td>
                      <td>{result.incidents ?? "-"}</td>
                      <td>{result.bestLap ?? "-"}</td>
                      <td>
                        {result.resultUrl ? (
                          <a href={result.resultUrl} target="_blank" rel="noreferrer">
                            Open
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
