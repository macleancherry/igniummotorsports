import { useEffect, useMemo, useState } from "react";
import { getIracingLive, getLive, getTiming } from "../lib/api";
import type { Driver, IracingLiveRow, LiveEvent, LiveTimingRow } from "../lib/types";

function fmtLapTime(s: number | null): string {
  if (s === null) return "-";
  const m = Math.floor(s / 60);
  const rem = (s % 60).toFixed(3).padStart(6, "0");
  return m > 0 ? `${m}:${rem}` : rem;
}

function fmtDelta(s: number | null): string {
  if (s === null) return "-";
  return `+${s.toFixed(3)}`;
}

export function LivePage() {
  const [event, setEvent] = useState<LiveEvent | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [timingRows, setTimingRows] = useState<LiveTimingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iracingRows, setIracingRows] = useState<IracingLiveRow[]>([]);
  const [iracingGeneratedAt, setIracingGeneratedAt] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const liveData = await getLive();
        if (!mounted) return;
        setEvent(liveData.event);
        setDrivers(liveData.drivers);

        if (liveData.event?.id) {
          const rows = await getTiming(liveData.event.id);
          if (!mounted) return;
          setTimingRows(rows);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load live data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!event?.id) return;

    const timer = setInterval(() => {
      getTiming(event.id)
        .then((rows) => setTimingRows(rows))
        .catch(() => undefined);
    }, 10_000);

    return () => clearInterval(timer);
  }, [event?.id]);

  useEffect(() => {
    function fetchIracing() {
      getIracingLive()
        .then(({ rows, generatedAt }) => {
          setIracingRows(rows);
          setIracingGeneratedAt(generatedAt);
        })
        .catch(() => undefined);
    }
    fetchIracing();
    const timer = setInterval(fetchIracing, 10_000);
    return () => clearInterval(timer);
  }, []);

  const statusClass = useMemo(() => `status-pill status-${event?.status ?? "scheduled"}`, [event?.status]);

  if (loading) return <section className="page-wrap"><p>Loading live race control...</p></section>;
  if (error) return <section className="page-wrap"><p className="error">{error}</p></section>;

  return (
    <section className="page-wrap">
      <h1>Ignium Live Race Control</h1>
      {!event && <p>No active or scheduled event yet.</p>}
      {event && (
        <>
          <article className="panel">
            <div className="panel-head">
              <h2>{event.title}</h2>
              <span className={statusClass}>{event.status}</span>
            </div>
            <p>{event.series} • {event.track} • {event.car}</p>
            <p>Team: {event.teamName ?? "Ignium Motorsport"}</p>
            <p>Start: {event.startTime ? new Date(event.startTime).toLocaleString() : "TBC"}</p>
            {event.notes && <p>{event.notes}</p>}
            <div className="link-row">
              {event.streamUrl && <a href={event.streamUrl} target="_blank" rel="noreferrer">Main stream</a>}
              {event.timingUrl && <a href={event.timingUrl} target="_blank" rel="noreferrer">External timing</a>}
            </div>
          </article>

          <article className="panel">
            <h2>Driver line-up</h2>
            <div className="lineup">
              {drivers.map((driver) => (
                <div key={driver.id} className="lineup-item">
                  <span>{driver.name}</span>
                  <span className="muted">#{driver.raceNumber ?? "-"}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <h2>Timing</h2>
            <div className="timing-table-wrap">
              <table className="timing-table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Class position</th>
                    <th>Car number</th>
                    <th>Driver</th>
                    <th>Lap</th>
                    <th>Last lap</th>
                    <th>Best lap</th>
                    <th>Gap</th>
                    <th>Interval</th>
                    <th>Pit status</th>
                    <th>Stream link</th>
                  </tr>
                </thead>
                <tbody>
                  {timingRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.position ?? "-"}</td>
                      <td>{row.classPosition ?? "-"}</td>
                      <td>{row.carNumber ?? "-"}</td>
                      <td>{row.driverName}</td>
                      <td>{row.lap ?? "-"}</td>
                      <td>{row.lastLap ?? "-"}</td>
                      <td>{row.bestLap ?? "-"}</td>
                      <td>{row.gap ?? "-"}</td>
                      <td>{row.interval ?? "-"}</td>
                      <td>{row.pitStatus ?? "-"}</td>
                      <td>
                        {row.streamUrl ? (
                          <a href={row.streamUrl} target="_blank" rel="noreferrer">Watch</a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}

      <article className="panel">
        <h2>iRacing Live Telemetry</h2>
        {iracingRows.length === 0 ? (
          <p>No iRacing session detected.</p>
        ) : (
          <div className="timing-table-wrap">
            <table className="timing-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Class</th>
                  <th>Car</th>
                  <th>Driver</th>
                  <th>Lap</th>
                  <th>Last Lap</th>
                  <th>Best Lap</th>
                  <th>Gap</th>
                  <th>Interval</th>
                </tr>
              </thead>
              <tbody>
                {iracingRows.map((row) => (
                  <tr key={row.customerId}>
                    <td>{row.position > 0 ? row.position : "-"}</td>
                    <td>{row.classPosition > 0 ? row.classPosition : "-"}</td>
                    <td>{row.carNumber || "-"}</td>
                    <td>{row.driverName}</td>
                    <td>{row.lap}</td>
                    <td>{fmtLapTime(row.lastLap)}</td>
                    <td>{fmtLapTime(row.bestLap)}</td>
                    <td>{fmtDelta(row.gap)}</td>
                    <td>{fmtDelta(row.interval)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {iracingGeneratedAt && (
              <p className="muted">Updated {new Date(iracingGeneratedAt).toLocaleTimeString()}</p>
            )}
          </div>
        )}
      </article>
    </section>
  );
}
