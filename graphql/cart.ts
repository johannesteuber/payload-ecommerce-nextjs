import { META } from "./meta";

export const CART = `cart {
  items {
    product {
      id
      slug
      priceJSON
      ${META}
      price
      title
    }
    quantity
  }
}`
