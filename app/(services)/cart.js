
import api from "./api";

const cartService = {
  addToCart: (productId, quantity = 1) =>
    api.post(
      `/cart/items?productId=${encodeURIComponent(productId)}&quantity=${encodeURIComponent(quantity)}`
    ),
    getCart: (productId) =>
    api.get(
      `/cart`
    ),
};

export default cartService;
