import { Link } from "react-router-dom";
import { sponsors } from "../data/sponsors";

export function SponsorsPage() {
  return (
    <>
      <section className="section compact subpage-hero">
        <div className="page-shell">
          <div className="eyebrow">Our Partners</div>
          <h1 className="subpage-title">Sponsors &amp; Partners</h1>
          <p className="subpage-intro">
            Ignium Motorsport is proud to work with sponsors and partners who share our commitment to hard work,
            dedication, and positivity.
          </p>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div className="news-grid">
            {sponsors.map((sponsor) => (
              <article key={sponsor.name} className="news-card">
                {sponsor.logoUrl ? <img src={sponsor.logoUrl} alt={sponsor.name} style={{ maxHeight: 48 }} /> : null}
                <div className="news-meta">{sponsor.tier}</div>
                <h3>{sponsor.name}</h3>
                {sponsor.url ? (
                  <a href={sponsor.url} target="_blank" rel="noopener noreferrer">
                    Visit website
                  </a>
                ) : null}
              </article>
            ))}
          </div>

          <div className="panel subpage-copy" style={{ marginTop: 24 }}>
            <h2>Interested In Partnering?</h2>
            <p>
              We're always open to conversations with commercial sponsors and partners. Get in touch and let's talk
              about how we can work together.
            </p>
            <div className="button-row">
              <Link className="button-primary" to="/contact">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
