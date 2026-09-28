import { Link } from "react-router-dom";
import { roster } from "../data/roster";
import { useInView } from "../hooks/useInView";
import { usePageMeta } from "../hooks/usePageMeta";

const VALUES = [
  {
    numeral: "01",
    title: "Hard Work",
    body: "Racing includes both good luck and bad luck, but success is earned through practice and preparation. We put in the work to improve every driver and strengthen the team.",
  },
  {
    numeral: "02",
    title: "Dedication",
    body: "We balance careers, family, and racing while staying focused on professional, sportsmanlike conduct. We represent Ignium with standards we can be proud of.",
  },
  {
    numeral: "03",
    title: "Positivity",
    body: "Wins and setbacks are both opportunities to learn. We stay positive under pressure and turn difficult races into fuel for stronger performances.",
  },
];

export function AboutPage() {
  usePageMeta(
    "About | Ignium Motorsport",
    "Ignium Motorsport is an iRacing endurance team built on three core morals: hard work, dedication, and positivity. We are committed to continuous improvement, professional conduct, and bringing passion to every lap."
  );

  const [valuesRef, valuesInView] = useInView<HTMLDivElement>();
  const [rosterRef, rosterInView] = useInView<HTMLDivElement>();
  const [missionRef, missionInView] = useInView<HTMLDivElement>();

  return (
    <>
      <section className="subpage-hero">
        <div className="page-shell">
          <span className="eyebrow">— About Ignium Motorsport</span>
          <h1 className="subpage-title">Racing With Purpose</h1>
          <p className="subpage-intro">
            Ignium Motorsport is an iRacing endurance team built on three core morals: hard work, dedication, and
            positivity. We are committed to continuous improvement, professional conduct, and bringing passion to
            every lap.
          </p>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div ref={valuesRef} className={`value-grid fade-up${valuesInView ? " is-in" : ""}`}>
            {VALUES.map((value) => (
              <div key={value.numeral} className="value-col">
                <span className="value-numeral">{value.numeral}</span>
                <h3>{value.title}</h3>
                <p>{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section compact" id="roster">
        <div className="page-shell">
          <div ref={rosterRef} className={`fade-up${rosterInView ? " is-in" : ""}`}>
            <div className="section-header">
              <h2>Entry List</h2>
              <span className="eyebrow">The Team</span>
            </div>
            <div className="entry-list">
              {roster.map((member, index) => (
                <div key={member.name} className="entry-row">
                  <span className="entry-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="entry-name">{member.name}</span>
                  <span className="entry-meta">
                    {[member.raceNumber ? `#${member.raceNumber}` : null, member.carClass]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div ref={missionRef} className={`stint-panel fade-up${missionInView ? " is-in" : ""}`}>
            <h2>Our Mission</h2>
            <p>
              We believe that by living these three morals, Ignium has the potential to excel and inspire others. We
              race hard, represent our sponsors well, and look forward to the journey ahead.
            </p>
            <p className="mono text-accent">Ignite Your Passion</p>
            <div className="button-row">
              <Link className="button-primary" to="/results">
                View Results
              </Link>
              <Link className="button-secondary" to="/sponsors">
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
