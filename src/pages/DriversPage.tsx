import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDrivers } from "../lib/api";
import type { Driver } from "../lib/types";

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
    <>
      <section className="section compact subpage-hero">
        <div className="page-shell">
          <div className="eyebrow">Roster</div>
          <h1 className="subpage-title">Drivers</h1>
          <p className="subpage-intro">
            Meet the drivers representing Ignium Motorsport across endurance racing and top-level iRacing competition.
          </p>
        </div>
      </section>

      <section className="section compact drivers-section">
        <div className="page-shell">
          {loading ? (
            <div className="empty-state">
              <h3>Loading Drivers</h3>
              <p>Fetching the latest driver roster and stats.</p>
            </div>
          ) : null}

          {error ? (
            <div className="empty-state">
              <h3>Data Loading Notice</h3>
              <p>{error}</p>
            </div>
          ) : null}

          {!loading && !error && drivers.length === 0 ? (
            <div className="empty-state">
              <h3>No Drivers Found</h3>
              <p>The roster is currently empty. Please check back shortly.</p>
            </div>
          ) : null}

          {!loading && !error && drivers.length > 0 ? (
            <div className="driver-grid">
              {drivers.map((driver) => {
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
                        <span>W {driver.wins ?? 0}</span>
                        <span>P {driver.podiums ?? 0}</span>
                        <span>iR {driver.irating ?? "-"}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}

          {!loading && !error && drivers.length > 0 ? (
            <div className="button-row" style={{ justifyContent: "center" }}>
              <Link className="button-primary" to="/live">
                Open Live Race Control
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
