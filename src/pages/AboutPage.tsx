import { Link } from "react-router-dom";

export function AboutPage() {
  return (
    <section className="page-wrap prose about-page">
      <h1>Racing with Purpose</h1>
      <p style={{ fontSize: "1.1rem", lineHeight: "1.75" }}>
        Ignium Motorsport was built for drivers who want to improve, compete and represent something bigger than an
        individual result. We race with purpose.
      </p>

      <h2 style={{ marginTop: "2rem" }}>Our Foundation: Three Core Values</h2>

      <div className="values-section">
        <div className="value-card">
          <h3>Hard Work</h3>
          <p>
            In racing you have good luck and bad luck, but there is no denying that to succeed you have to practice.
            Ignium Motorsport is willing to put the practice in to better the drivers and the team. Luck changes.
            Preparation compounds.
          </p>
        </div>

        <div className="value-card">
          <h3>Dedication</h3>
          <p>
            Everyone has to work and juggle family time alongside racing, but the team is committed to making sure
            Ignium Motorsport is not associated with unsportsmanlike conduct or poor behaviour. We lead by example in
            every session, every race, every series.
          </p>
        </div>

        <div className="value-card">
          <h3>Positivity</h3>
          <p>
            Racing brings good luck and bad luck. Ignium remains positive, reflects on what could be done differently
            next time, and uses negative moments to become better and come back stronger. Every result is a step
            forward.
          </p>
        </div>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Our Attitude to Racing</h2>
      <p>
        Ignium Motorsport competes at iRacing's highest levels across multiple series. We focus on:
      </p>
      <ul>
        <li>
          <strong>Preparation:</strong> Disciplined practice, data review, and continuous improvement between races.
        </li>
        <li>
          <strong>Respect:</strong> Professional, sportsmanlike conduct in every session. Racing is how we represent
          ourselves and our team.
        </li>
        <li>
          <strong>Progress:</strong> Learning from every race—wins and losses alike. We use hard races as fuel to come
          back stronger.
        </li>
        <li>
          <strong>Balance:</strong> We race seriously while balancing real life. Racing shouldn't come at the cost of
          family, work or well-being.
        </li>
      </ul>

      <h2 style={{ marginTop: "2rem" }}>Ignite Your Passion</h2>
      <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--ignium-blue)" }}>
        Based on hard work, dedication and positivity, Ignium Motorsport has the potential to excel and ignite the
        passion of every driver who wears the colours.
      </p>

      <p>
        This platform brings together live timing, driver profiles, race results and team news into one cohesive race
        control hub where our journey is visible and accountable.
      </p>

      <div className="link-row" style={{ marginTop: "2rem" }}>
        <Link className="btn-primary" to="/live">
          Open Live Race Control
        </Link>
        <Link className="btn-ghost" to="/drivers">
          Meet the Drivers
        </Link>
      </div>
    </section>
  );
}
