import { Fragment } from "react";
import type { ManualResult } from "../data/results";
import { formatResultDate, isPodium, parseFinish } from "../lib/results";

type ResultsTableProps = {
  results: ManualResult[];
  caption?: string;
};

export function ResultsTable({ results, caption = "Ignium Motorsport race results" }: ResultsTableProps) {
  return (
    <div className="results-table-wrap">
      <table className="results-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Pos</th>
            <th scope="col">Class</th>
            <th scope="col">Event</th>
            <th scope="col">Series</th>
            <th scope="col">Date</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => {
            const parsed = parseFinish(result.finish);
            const podium = isPodium(result.finish);
            const hasNote = Boolean(result.note || result.instagramUrl);

            return (
              <Fragment key={result.id}>
                <tr className={podium ? "is-podium" : undefined}>
                  {parsed ? (
                    <>
                      <td data-label="Pos">P{parsed.overall}</td>
                      <td data-label="Class">{parsed.inClass ? `P${parsed.inClass}` : "—"}</td>
                      <td data-label="Event">{result.track}</td>
                      <td data-label="Series">{result.series}</td>
                      <td data-label="Date">{formatResultDate(result.date)}</td>
                    </>
                  ) : (
                    <td colSpan={5} data-label="Result">
                      <strong>{result.track}</strong> — {result.series}
                      {result.finish ? ` — ${result.finish}` : ""}
                    </td>
                  )}
                </tr>
                {hasNote && (
                  <tr className="result-note-row">
                    <td colSpan={5}>
                      {result.note}
                      {result.instagramUrl && (
                        <a href={result.instagramUrl} target="_blank" rel="noopener noreferrer">
                          View on Instagram ↗
                        </a>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
