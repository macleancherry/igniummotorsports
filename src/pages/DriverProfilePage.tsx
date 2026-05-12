import { useEffect, useState } from "react";
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

  if (loading) return <section className="page-wrap"><p>Loading driver...</p></section>;
  if (error) return <section className="page-wrap"><p className="error">{error}</p></section>;
  if (!driver) return <section className="page-wrap"><p>Driver not found.</p></section>;

  return (
    <section className="page-wrap">
      <div className="panel">
        <h1>{driver.name}</h1>
        <p>#{driver.raceNumber ?? "-"} • {driver.country ?? "Unknown"}</p>
        <p>{driver.bio}</p>
        <p>iRacing customer ID: {driver.iracingCustomerId ?? "N/A"}</p>
        <div className="link-row">
          {driver.twitchUrl && <a href={driver.twitchUrl} target="_blank" rel="noreferrer">Twitch</a>}
          {driver.youtubeUrl && <a href={driver.youtubeUrl} target="_blank" rel="noreferrer">YouTube</a>}
        </div>
      </div>

      <h2>Recent results</h2>
      {results.length === 0 && <p className="muted">No results available yet.</p>}
      <div className="results-cards">
        {results.map((result) => (
          <article key={result.id} className="result-card">
            <h3>{result.series ?? "Session"}</h3>
            <p>{result.track}</p>
            <p>{result.car}</p>
            <p>Start P{result.startPosition ?? "-"} → Finish P{result.finishPosition ?? "-"}</p>
            <p>Class P{result.classPosition ?? "-"} • Inc {result.incidents ?? "-"}</p>
            <p>Best lap {result.bestLap ?? "-"}</p>
            {result.resultUrl && (
              <a href={result.resultUrl} target="_blank" rel="noreferrer">
                iRacing result
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
