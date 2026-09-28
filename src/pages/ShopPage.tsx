import { shopItems } from "../data/shop";
import { useInView } from "../hooks/useInView";

const SIZES = ["S", "M", "L", "XL", "XXL"];

export function ShopPage() {
  const [gridRef, gridInView] = useInView<HTMLDivElement>();

  return (
    <>
      <section className="subpage-hero">
        <div className="page-shell">
          <span className="eyebrow">— Team Merch</span>
          <h1 className="subpage-title">Shop</h1>
          <p className="subpage-intro">A preview of upcoming Ignium Motorsport merch — orders aren't open yet.</p>
        </div>
      </section>

      <section className="section studio">
        <div className="page-shell">
          <div ref={gridRef} className={`product-grid fade-up${gridInView ? " is-in" : ""}`}>
            {shopItems.map((item) => (
              <div key={item.id} className="product-card">
                <span className="orders-tag">
                  <span className="orders-tag-dot" aria-hidden="true" />
                  Orders Open Soon
                </span>
                <h3>{item.name}</h3>
                <span className="product-price">{item.price}</span>
                {item.description ? <p>{item.description}</p> : null}
                <div className="size-chip-row">
                  {SIZES.map((size) => (
                    <span key={size} className="size-chip">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
