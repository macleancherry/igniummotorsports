import { useEffect, useState } from "react";
import { getResults } from "../lib/api";
import type { ResultRow } from "../lib/types";

export function ResultsPage() {
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getResults()
      .then((data) => {
        if (mounted) setRows(data);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load results.");
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
          <div className="eyebrow">Performance Data</div>
          <h1 className="subpage-title">Recent Team Results</h1>
          <p className="subpage-intro">
            Track-by-track results including start position, finish, class result, incidents, and official links.
          </p>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          {loading ? (
            <div className="empty-state">
              <h3>Loading Results</h3>
              <p>Fetching latest race records.</p>
            </div>
          ) : null}

          {error ? (
            <div className="empty-state">
              <h3>Data Loading Notice</h3>
              <p>{error}</p>
            </div>
          ) : null}

          {!loading && !error && rows.length === 0 ? (
            <div className="empty-state">
              <h3>No Results Yet</h3>
              <p>There are no race results available at the moment.</p>
            </div>
          ) : null}

          {!loading && !error && rows.length > 0 ? (
            <div className="timing-table-wrap">
              <table className="timing-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Series</th>
                    <th>Track</th>
                    <th>Driver</th>
                    <th>Start</th>
                    <th>Finish</th>
                    <th>Class</th>
                    <th>Inc</th>
                    <th>Best Lap</th>
                    <th>SOF</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((result) => (
                    <tr key={result.id}>
                      <td>
                        {result.completedAt
                          ? new Date(result.completedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </td>
                      <td>{result.series ?? "-"}</td>
                      <td>{result.track ?? "-"}</td>
                      <td>{result.driverName ?? "-"}</td>
                      <td>P{result.startPosition ?? "-"}</td>
                      <td>P{result.finishPosition ?? "-"}</td>
                      <td>P{result.classPosition ?? "-"}</td>
                      <td>{result.incidents ?? "-"}</td>
                      <td>{result.bestLap ?? "-"}</td>
                      <td>{result.strengthOfField ?? "-"}</td>
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
          ) : null}
        </div>
      </section>
    </>
  );
}
