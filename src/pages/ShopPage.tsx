import { shopItems } from "../data/shop";

export function ShopPage() {
  return (
    <>
      <section className="section compact subpage-hero">
        <div className="page-shell">
          <div className="eyebrow">Team Merch</div>
          <h1 className="subpage-title">Shop</h1>
          <p className="subpage-intro">
            A preview of upcoming Ignium Motorsport merch — orders aren't open yet.
          </p>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div className="news-grid">
            {shopItems.map((item) => (
              <article key={item.id} className="news-card">
                <div className="news-meta">{item.price}</div>
                <h3>{item.name}</h3>
                {item.description ? <p>{item.description}</p> : null}
                <div className="coming-soon-badge">Coming Soon</div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
