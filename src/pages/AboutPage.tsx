import { Link } from "react-router-dom";
import { roster } from "../data/roster";

export function AboutPage() {
  return (
    <>
      <section className="section compact subpage-hero">
        <div className="page-shell">
          <div className="eyebrow">About Ignium Motorsport</div>
          <h1 className="subpage-title">Racing With Purpose</h1>
          <p className="subpage-intro">
            Ignium Motorsport is an iRacing endurance team built on three core morals: hard work, dedication, and
            positivity. We are committed to continuous improvement, professional conduct, and bringing passion to
            every lap.
          </p>
        </div>
      </section>

      <section className="section compact values-section">
        <div className="page-shell">
          <h2 className="values-title">Our Foundation: Three Core Values</h2>
          <div className="value-grid">
            <article className="value-card">
              <div className="value-icon">🔨</div>
              <div>
                <h3>Hard Work</h3>
                <p>
                  Racing includes both good luck and bad luck, but success is earned through practice and preparation.
                  We put in the work to improve every driver and strengthen the team.
                </p>
              </div>
            </article>

            <article className="value-card">
              <div className="value-icon">💪</div>
              <div>
                <h3>Dedication</h3>
                <p>
                  We balance careers, family, and racing while staying focused on professional, sportsmanlike conduct.
                  We represent Ignium with standards we can be proud of.
                </p>
              </div>
            </article>

            <article className="value-card">
              <div className="value-icon">⚡</div>
              <div>
                <h3>Positivity</h3>
                <p>
                  Wins and setbacks are both opportunities to learn. We stay positive under pressure and turn difficult
                  races into fuel for stronger performances.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section compact" id="roster">
        <div className="page-shell">
          <div className="section-header">
            <h2>Roster</h2>
            <div className="eyebrow">The Team</div>
          </div>
          <div className="lineup">
            {roster.map((member) => (
              <div key={member.name} className="lineup-item">
                <span>{member.name}</span>
                <span className="muted">
                  {[member.raceNumber ? `#${member.raceNumber}` : null, member.carClass].filter(Boolean).join(" · ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div className="panel subpage-copy">
            <h2>Our Mission</h2>
            <p>
              We believe that by living these three morals, Ignium has the potential to excel and inspire others.
              We race hard, represent our sponsors well, and look forward to the journey ahead.
            </p>
            <p className="subpage-highlight">Ignite Your PASSION</p>
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
