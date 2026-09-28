import { championships } from "../data/championships";
import { results } from "../data/results";
import { ResultsTable } from "../components/ResultsTable";
import { sortResultsByDateDesc } from "../lib/results";
import { useInView } from "../hooks/useInView";
import { usePageMeta } from "../hooks/usePageMeta";

export function ResultsPage() {
  usePageMeta(
    "Results & Championships | Ignium Motorsport",
    "A hand-updated record of recent race results, and the leagues we currently compete in."
  );

  const [resultsRef, resultsInView] = useInView<HTMLDivElement>();
  const [champsRef, champsInView] = useInView<HTMLDivElement>();
  const sortedResults = sortResultsByDateDesc(results);

  return (
    <>
      <section className="subpage-hero">
        <div className="page-shell">
          <span className="eyebrow">— Performance Data</span>
          <h1 className="subpage-title">Results &amp; Championships</h1>
          <p className="subpage-intro">
            A hand-updated record of recent race results, and the leagues we currently compete in.
          </p>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div ref={resultsRef} className={`fade-up${resultsInView ? " is-in" : ""}`}>
            <div className="section-header">
              <h2>Recent Results</h2>
            </div>
            {sortedResults.length === 0 ? (
              <div className="empty-state">
                <h3>No Results Yet</h3>
                <p>There are no race results available at the moment.</p>
              </div>
            ) : (
              <ResultsTable results={sortedResults} />
            )}
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div ref={champsRef} className={`fade-up${champsInView ? " is-in" : ""}`}>
            <div className="section-header">
              <h2>Championships &amp; Ladders</h2>
            </div>
            {championships.map((championship) => (
              <div key={championship.name} className="series-entry-row">
                <div>
                  <h3>{championship.name}</h3>
                  {championship.description ? <p>{championship.description}</p> : null}
                </div>
                <div>
                  <span className="series-entry-platform">iRacing</span>
                  {championship.url ? (
                    <p>
                      <a href={championship.url} target="_blank" rel="noopener noreferrer">
                        Learn more ↗
                      </a>
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
