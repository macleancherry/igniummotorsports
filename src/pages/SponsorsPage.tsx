import { Link } from "react-router-dom";
import { sponsors } from "../data/sponsors";
import { useInView } from "../hooks/useInView";
import { usePageMeta } from "../hooks/usePageMeta";

const LIVERY_SPECS = [
  {
    number: 1,
    area: "Bonnet",
    detail: "Primary logo placement — the largest, most visible spot on the car.",
    x: 32,
    y: 38,
  },
  {
    number: 2,
    area: "Door",
    detail: "Side panel branding, visible in pit lane and trackside photography.",
    x: 47,
    y: 56,
  },
  {
    number: 3,
    area: "Rear Wing",
    detail: "High-visibility placement for chase-camera and replay angles.",
    x: 87,
    y: 33,
  },
  {
    number: 4,
    area: "Windscreen Banner",
    detail: "Driver-eye-level branding across the top of the windscreen.",
    x: 51,
    y: 32,
  },
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
              <div className="livery-photo-wrap">
                <img
                  className="livery-photo"
                  src="/assets/sponsor-car.webp"
                  alt="Ignium Motorsport's #125 GT3 car in profile, with numbered markers on the bonnet, door, rear wing, and windscreen banner showing where sponsor logos are placed"
                />
                {LIVERY_SPECS.map((spec) => (
                  <span
                    key={spec.number}
                    className="livery-hotspot"
                    style={{ left: `${spec.x}%`, top: `${spec.y}%` }}
                    aria-hidden="true"
                  >
                    {spec.number}
                  </span>
                ))}
              </div>
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
