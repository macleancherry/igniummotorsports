import { results } from "../data/results";

export function ResultsPage() {
  return (
    <>
      <section className="section compact subpage-hero">
        <div className="page-shell">
          <div className="eyebrow">Performance Data</div>
          <h1 className="subpage-title">Recent Team Results</h1>
          <p className="subpage-intro">A hand-updated record of recent race results.</p>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          {results.length === 0 ? (
            <div className="empty-state">
              <h3>No Results Yet</h3>
              <p>There are no race results available at the moment.</p>
            </div>
          ) : (
            <div className="news-grid">
              {results.map((result) => (
                <article key={result.id} className="news-card">
                  <div className="news-meta">{result.series}</div>
                  <h3>{result.track}</h3>
                  <p>
                    {new Date(result.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {result.finish ? ` · ${result.finish}` : ""}
                  </p>
                  {result.note ? <p>{result.note}</p> : null}
                  {result.instagramUrl ? (
                    <a href={result.instagramUrl} target="_blank" rel="noopener noreferrer">
                      View on Instagram
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
