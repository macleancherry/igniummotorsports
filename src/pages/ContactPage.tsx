import { SocialLinksList } from "../components/SocialLinksList";

export function ContactPage() {
  return (
    <>
      <section className="subpage-hero">
        <div className="page-shell">
          <span className="eyebrow">— Get In Touch</span>
          <h1 className="subpage-title">Contact Us</h1>
          <p className="subpage-intro">
            For sponsorship, partnership, or commercial enquiries, reach out and we'll get back to you.
          </p>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div className="contact-grid">
            <div>
              <h2>Find Us Online</h2>
              <p>Follow along for race weekends, results, and behind-the-scenes updates.</p>
              <SocialLinksList />
            </div>

            <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
              <div className="form-field">
                <label htmlFor="contact-name">Name</label>
                <input id="contact-name" type="text" name="name" autoComplete="name" />
              </div>
              <div className="form-field">
                <label htmlFor="contact-email">Email</label>
                <input id="contact-email" type="email" name="email" autoComplete="email" />
              </div>
              <div className="form-field">
                <label htmlFor="contact-message">Message</label>
                <textarea id="contact-message" name="message" rows={5} />
              </div>
              <div>
                <a className="button-primary" href="mailto:partnerships@igniummotorsports.com">
                  Send Via Email
                </a>
                <p className="form-caption" style={{ marginTop: 12 }}>
                  Opens your email client, addressed to partnerships@igniummotorsports.com.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
