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
    <section className="page-wrap">
      <h1>Recent Team Results</h1>
      {loading && <p>Loading results...</p>}
      {error && <p className="error">{error}</p>}
      <div className="stack">
        {rows.map((result) => (
          <article key={result.id} className="panel">
            <h2>{result.series} - {result.track}</h2>
            <p>{result.car} ({result.carClass})</p>
            <p>Driver/Team: {result.driverName ?? "-"} / {result.teamName ?? "Ignium Motorsport"}</p>
            <p>Start P{result.startPosition ?? "-"} • Finish P{result.finishPosition ?? "-"} • Class P{result.classPosition ?? "-"}</p>
            <p>Best lap {result.bestLap ?? "-"} • Incidents {result.incidents ?? "-"} • SOF {result.strengthOfField ?? "-"}</p>
            <p className="muted">{result.completedAt ? new Date(result.completedAt).toLocaleString() : "Unknown date"}</p>
            {result.resultUrl && <a href={result.resultUrl} target="_blank" rel="noreferrer">Open iRacing result</a>}
          </article>
        ))}
      </div>
    </section>
  );
}
