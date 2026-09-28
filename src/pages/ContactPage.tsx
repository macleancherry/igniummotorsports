export function ContactPage() {
  return (
    <>
      <section className="section compact subpage-hero">
        <div className="page-shell">
          <div className="eyebrow">Get In Touch</div>
          <h1 className="subpage-title">Contact Us</h1>
          <p className="subpage-intro">
            For sponsorship, partnership, or commercial enquiries, reach out and we'll get back to you.
          </p>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div className="button-row" style={{ marginTop: 0 }}>
            <a className="button-primary" href="mailto:partnerships@igniummotorsports.com">
              partnerships@igniummotorsports.com
            </a>
          </div>

          <div className="panel subpage-copy" style={{ marginTop: 32 }}>
            <h2>Follow Us</h2>
            <div className="footer-links">
              <a href="https://discord.gg/ignium" target="_blank" rel="noopener noreferrer">Discord</a>
              <a href="https://www.instagram.com/ignium_motorsport" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.youtube.com/@igniummotorsport" target="_blank" rel="noopener noreferrer">YouTube</a>
              <a href="https://www.twitch.tv/igniumotorsport" target="_blank" rel="noopener noreferrer">Twitch</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
