/**
 * Ignium Motorsport shop items.
 *
 * Plain hand-edited list — this is a display-only page, not a real store.
 * No cart, checkout, or payments are wired up. Add real product photos and
 * prices here when the shop actually launches.
 *
 * Shape:
 *   {
 *     id: string;          // stable key
 *     name: string;        // product name
 *     price: string;       // display price, e.g. "£25"
 *     description?: string; // one line about the product (optional)
 *   }
 */
export type ShopItem = {
  id: string;
  name: string;
  price: string;
  description?: string;
};

export const shopItems: ShopItem[] = [
  { id: "tshirt", name: "Team T-Shirt", price: "£25", description: "Ignium Motorsport branded T-shirt. Sizes S–XXL." },
  { id: "hoodie", name: "Team Hoodie", price: "£45", description: "Ignium Motorsport branded hoodie. Sizes S–XXL." },
];
