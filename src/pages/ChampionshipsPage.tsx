import { championships } from "../data/championships";

export function ChampionshipsPage() {
  return (
    <>
      <section className="section compact subpage-hero">
        <div className="page-shell">
          <div className="eyebrow">Where We Race</div>
          <h1 className="subpage-title">Championships &amp; Ladders</h1>
          <p className="subpage-intro">
            The leagues, championships, and ladders Ignium Motorsport drivers currently compete in.
          </p>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
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
