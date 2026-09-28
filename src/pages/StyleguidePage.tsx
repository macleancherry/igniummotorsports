import { usePageMeta } from "../hooks/usePageMeta";

const SWATCHES = [
  { name: "--ink-950", value: "#04080e" },
  { name: "--ink-900", value: "#07111d" },
  { name: "--ink-800", value: "#0c1928" },
  { name: "--ink-700", value: "#15263a" },
  { name: "--text", value: "#f2f5f8" },
  { name: "--text-dim", value: "#9aa4af" },
  { name: "--ignium", value: "#16a8e2" },
  { name: "--studio", value: "#e8ebee" },
  { name: "--flag", value: "#ffd21f" },
];

// Dev-only style reference. Not linked from navigation — reachable only at /styleguide.
export function StyleguidePage() {
  usePageMeta("Styleguide | Ignium Motorsport", "Internal design reference — not linked from site navigation.");

  return (
    <div className="section">
      <div className="page-shell">
        <span className="eyebrow">— Dev Reference</span>
        <h1 className="subpage-title">Night Stint Styleguide</h1>
        <p style={{ marginBottom: 48 }}>
          Type scale, color tokens, and component samples for the Night Stint design system. Not linked from site
          navigation.
        </p>

        <section style={{ marginBottom: 56 }}>
          <h2 style={{ marginBottom: 24 }}>Type Scale</h2>
          <h1>H1 Heading</h1>
          <h2>H2 Heading</h2>
          <h3>H3 Heading</h3>
          <p>Body paragraph text sits on --text-dim by default, at --text-body size.</p>
          <p className="mono">Mono label text</p>
        </section>

        <section style={{ marginBottom: 56 }}>
          <h2 style={{ marginBottom: 24 }}>Color Tokens</h2>
          <div className="swatch-grid">
            {SWATCHES.map((swatch) => (
              <div key={swatch.name} className="swatch">
                <div className="swatch-block" style={{ background: swatch.value }} />
                <span className="swatch-label">{swatch.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 56 }}>
          <h2 style={{ marginBottom: 24 }}>Buttons &amp; Tags</h2>
          <div className="button-row" style={{ marginTop: 0 }}>
            <button type="button" className="button-primary">
              Primary Button
            </button>
            <button type="button" className="button-secondary">
              Secondary Button
            </button>
            <button type="button" className="button-ghost">
              Ghost Button
            </button>
          </div>
          <div className="button-row">
            <span className="article-tag-latest">Latest</span>
            <span className="orders-tag">
              <span className="orders-tag-dot" aria-hidden="true" />
              Orders Open Soon
            </span>
          </div>
        </section>

        <section style={{ marginBottom: 56 }}>
          <h2 style={{ marginBottom: 24 }}>Table</h2>
          <div className="results-table-wrap">
            <table className="results-table">
              <caption className="visually-hidden">Sample results table</caption>
              <thead>
                <tr>
                  <th scope="col">Pos</th>
                  <th scope="col">Class</th>
                  <th scope="col">Event</th>
                  <th scope="col">Series</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="is-podium">
                  <td data-label="Pos">P1</td>
                  <td data-label="Class">P1</td>
                  <td data-label="Event">Example: Long Beach</td>
                  <td data-label="Series">Example: GT3 Sprint Series</td>
                  <td data-label="Date">Mar 28, 2026</td>
                </tr>
                <tr>
                  <td data-label="Pos">P7</td>
                  <td data-label="Class">P5</td>
                  <td data-label="Event">Example: Watkins Glen</td>
                  <td data-label="Series">Example: IMSA Endurance Series</td>
                  <td data-label="Date">Apr 12, 2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 style={{ marginBottom: 24 }}>Form Fields</h2>
          <form className="contact-form" style={{ maxWidth: 480 }} onSubmit={(event) => event.preventDefault()}>
            <div className="form-field">
              <label htmlFor="styleguide-name">Name</label>
              <input id="styleguide-name" type="text" />
            </div>
            <div className="form-field">
              <label htmlFor="styleguide-message">Message</label>
              <textarea id="styleguide-message" rows={3} />
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
