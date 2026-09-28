import { Link } from "react-router-dom";
import { sponsors } from "../data/sponsors";
import { LiveryDiagram } from "../components/LiveryDiagram";
import { useInView } from "../hooks/useInView";
import { usePageMeta } from "../hooks/usePageMeta";

const LIVERY_SPECS = [
  { number: 1, area: "Bonnet", detail: "Primary logo placement — the largest, most visible spot on the car." },
  { number: 2, area: "Door", detail: "Side panel branding, visible in pit lane and trackside photography." },
  { number: 3, area: "Rear Wing", detail: "High-visibility placement for chase-camera and replay angles." },
  { number: 4, area: "Windscreen Banner", detail: "Driver-eye-level branding across the top of the windscreen." },
];

export function SponsorsPage() {
  usePageMeta(
    "Sponsors & Partners | Ignium Motorsport",
    "Ignium Motorsport is proud to work with sponsors and partners who share our commitment to hard work, dedication, and positivity."
  );

  const [wallRef, wallInView] = useInView<HTMLDivElement>();
  const [liveryRef, liveryInView] = useInView<HTMLDivElement>();

  return (
    <>
      <section className="subpage-hero">
        <div className="page-shell">
          <span className="eyebrow">— Our Partners</span>
          <h1 className="subpage-title">Sponsors &amp; Partners</h1>
          <p className="subpage-intro">
            Ignium Motorsport is proud to work with sponsors and partners who share our commitment to hard work,
            dedication, and positivity.
          </p>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div ref={wallRef} className={`fade-up${wallInView ? " is-in" : ""}`}>
            <div className="partner-wall">
              {sponsors.map((sponsor) => (
                <div key={sponsor.name} className="partner-cell">
                  {sponsor.logoUrl ? (
                    <img src={sponsor.logoUrl} alt={sponsor.name} />
                  ) : (
                    <div>
                      <span className="partner-cell-name">{sponsor.name}</span>
                      {sponsor.tier && <span className="partner-cell-tier">{sponsor.tier}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {sponsors.some((sponsor) => sponsor.url) && (
              <p style={{ marginTop: 16 }}>
                {sponsors
                  .filter((sponsor) => sponsor.url)
                  .map((sponsor) => (
                    <a
                      key={sponsor.name}
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginRight: 16 }}
                    >
                      {sponsor.name} ↗
                    </a>
                  ))}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="section studio">
        <div className="page-shell">
          <div ref={liveryRef} className={`fade-up${liveryInView ? " is-in" : ""}`}>
            <span className="eyebrow">— Livery Placements</span>
            <h2>Where Your Brand Rides</h2>
            <div className="livery-layout">
              <LiveryDiagram />
              <div>
                <ol className="livery-spec-list">
                  {LIVERY_SPECS.map((spec) => (
                    <li key={spec.number}>
                      <span className="mono-num">{String(spec.number).padStart(2, "0")}</span>
                      <span>
                        <strong>{spec.area}</strong> — {spec.detail}
                      </span>
                    </li>
                  ))}
                </ol>
                <Link className="button-primary" to="/contact">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
