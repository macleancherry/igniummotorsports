import { championships } from "../data/championships";
import { results } from "../data/results";

export function ResultsPage() {
  return (
    <>
      <section className="section compact subpage-hero">
        <div className="page-shell">
          <div className="eyebrow">Performance Data</div>
          <h1 className="subpage-title">Results &amp; Championships</h1>
          <p className="subpage-intro">A hand-updated record of recent race results, and the leagues we currently compete in.</p>
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

      <section className="section compact">
        <div className="page-shell">
          <div className="section-header">
            <h2>Championships &amp; Ladders</h2>
          </div>
          <div className="news-grid">
            {championships.map((championship) => (
              <article key={championship.name} className="news-card">
                <h3>{championship.name}</h3>
                {championship.description ? <p>{championship.description}</p> : null}
                {championship.url ? (
                  <a href={championship.url} target="_blank" rel="noopener noreferrer">
                    Learn more
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
