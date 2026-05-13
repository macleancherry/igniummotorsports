export function AboutPage() {
  return (
    <section className="page-wrap prose">
      <h1>About Ignium Motorsport</h1>
      <p>
        Ignium Motorsport is an iRacing endurance racing team built on three core morals: hard work, dedication, and positivity.
        We're committed to continuous improvement, professional conduct, and bringing passion to every lap.
      </p>

      <h2>Our Three Morals</h2>

      <div className="values-section">
        <div className="value-card">
          <h3><span className="value-icon">HW</span> Hard Work</h3>
          <p>
            Racing involves both good luck and bad luck, but success is earned through practice and preparation.
            We invest the time and effort needed to improve ourselves and strengthen our team.
            There are no shortcuts to excellence.
          </p>
        </div>

        <div className="value-card">
          <h3><span className="value-icon">DD</span> Dedication</h3>
          <p>
            We juggle careers, families, and racing responsibilities—but never lose focus on what matters.
            Our commitment to professional, sportsmanlike conduct protects both our reputation and the integrity of every race.
            We lead by example, every session.
          </p>
        </div>

        <div className="value-card">
          <h3><span className="value-icon">PX</span> Positivity</h3>
          <p>
            Wins and losses are both opportunities to learn. We stay positive in adversity and extract lessons from every situation—
            good or bad. We transform setbacks into fuel for improvement and drive forward stronger.
          </p>
        </div>
      </div>

      <h2>Our Mission</h2>
      <p className="mission-statement">
        <strong>Ignite Your PASSION</strong>
      </p>
      <p>
        We believe that by living these three morals, Ignium has the potential to excel and inspire others.
        This platform is built to support that mission—bringing together streams, result history, driver profiles, and live timing
        into one cohesive race control hub where excellence is visible and accountable.
      </p>
      <p>
        We look forward to the journey.
      </p>
    </section>
  );
}
