import { Link } from "react-router-dom";

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

      <section className="section compact">
        <div className="page-shell">
          <div className="panel subpage-copy">
            <h2>Our Mission</h2>
            <p>
              We believe that by living these three morals, Ignium has the potential to excel and inspire others.
              This platform brings together streams, result history, driver profiles, and live timing into one race
              control hub where performance is visible and accountable.
            </p>
            <p className="subpage-highlight">Ignite Your PASSION</p>
            <div className="button-row">
              <Link className="button-primary" to="/live">
                Open Live Race Control
              </Link>
              <Link className="button-secondary" to="/drivers">
                Meet the Drivers
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
