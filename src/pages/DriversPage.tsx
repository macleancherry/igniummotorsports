import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDrivers } from "../lib/api";
import type { Driver } from "../lib/types";

export function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getDrivers()
      .then((rows) => {
        if (mounted) setDrivers(rows);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load drivers.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="page-wrap">
      <h1>Drivers</h1>
      {loading && <p>Loading drivers...</p>}
      {error && <p className="error">{error}</p>}
      <div className="grid cards-3">
        {drivers.map((driver) => (
          <article className="card" key={driver.id}>
            {driver.avatarUrl && <img src={driver.avatarUrl} alt={driver.name} className="avatar" />}
            <h2>{driver.name}</h2>
            <p>#{driver.raceNumber ?? "-"} • {driver.country ?? "Unknown"}</p>
            <p>{driver.bio}</p>
            <p>
              Sessions {driver.totalSessions ?? 0} • Wins {driver.wins ?? 0} • Podiums {driver.podiums ?? 0}
            </p>
            <p>
              Best finish P{driver.bestFinishPosition ?? "-"}
              {driver.irating ? ` • iRating ${driver.irating}` : ""}
            </p>
            <div className="link-row">
              {driver.twitchUrl && <a href={driver.twitchUrl} target="_blank" rel="noreferrer">Twitch</a>}
              {driver.youtubeUrl && <a href={driver.youtubeUrl} target="_blank" rel="noreferrer">YouTube</a>}
            </div>
            <Link to={`/drivers/${driver.slug}`}>Driver profile</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
