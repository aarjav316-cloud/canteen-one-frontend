const CART_KEY = "canteen_cart";
const ORDERS_KEY = "canteen_orders";
export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
};
export const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};
export const addToCart = (item) => {
  const cart = getCart();
  const existing = cart.find((i) => i._id === item._id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  saveCart(cart);
  return cart;
};
export const removeFromCart = (itemId) => {
  const cart = getCart().filter((i) => i._id !== itemId);
  saveCart(cart);
  return cart;
};
export const updateCartQty = (itemId, quantity) => {
  let cart = getCart();
  if (quantity < 1) {
    cart = cart.filter((i) => i._id !== itemId);
  } else {
    const item = cart.find((i) => i._id === itemId);
    if (item) item.quantity = quantity;
  }
  saveCart(cart);
  return cart;
};
export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};
export const getCartCount = () => {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
};
export const getOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
};
export const placeLocalOrder = (cartItems) => {
  const orders = getOrders();
  const newOrder = {
    _id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase(),
    items: cartItems.map((i) => ({
      name: i.name,
      category: i.category,
      price: i.price,
      quantity: i.quantity,
    })),
    totalAmount: cartItems.reduce((s, i) => s + i.price * i.quantity, 0),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return newOrder;
};
export const updateOrderStatus = (orderId, status) => {
  const orders = getOrders();
  const order = orders.find((o) => o._id === orderId);
  if (order) {
    order.status = status;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
};
