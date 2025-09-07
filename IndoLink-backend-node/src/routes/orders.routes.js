const { Router } = require('express');
const { protect, requireRoles } = require('../middleware/auth');
const { sendSuccess } = require('../utils/response');

const router = Router();

// Minimal in-memory cart per user (non-persistent for demo)
const carts = new Map();
// Minimal in-memory orders store (admin-managed)
const ordersStore = [];

router.get('/cart', protect, requireRoles('BUYER'), (req, res) => {
  const cart = carts.get(req.user._id.toString()) || { items: [] };
  return sendSuccess(res, cart);
});

router.post('/cart', protect, requireRoles('BUYER'), (req, res) => {
  const userId = req.user._id.toString();
  const cart = carts.get(userId) || { items: [] };
  const { product, quantity } = req.body;
  cart.items.push({ id: Date.now().toString(), product, quantity: quantity || 1 });
  carts.set(userId, cart);
  return sendSuccess(res, cart);
});

router.put('/cart/items/:itemId', protect, requireRoles('BUYER'), (req, res) => {
  const userId = req.user._id.toString();
  const cart = carts.get(userId) || { items: [] };
  const item = cart.items.find((i) => i.id === req.params.itemId);
  if (item) item.quantity = req.body.quantity;
  carts.set(userId, cart);
  return sendSuccess(res, cart);
});

router.delete('/cart/items/:itemId', protect, requireRoles('BUYER'), (req, res) => {
  const userId = req.user._id.toString();
  const cart = carts.get(userId) || { items: [] };
  cart.items = cart.items.filter((i) => i.id !== req.params.itemId);
  carts.set(userId, cart);
  return sendSuccess(res, cart);
});

router.post('/checkout', protect, requireRoles('BUYER'), (req, res) => {
  const userId = req.user._id.toString();
  const cart = carts.get(userId) || { items: [] };
  const order = {
    id: Date.now().toString(),
    buyerId: userId,
    items: cart.items,
    status: 'PLACED',
    created_at: new Date().toISOString(),
  };
  ordersStore.push(order);
  carts.delete(userId);
  return sendSuccess(res, { orderId: order.id, status: order.status });
});

router.get('/', protect, requireRoles('BUYER'), (req, res) => {
  return sendSuccess(res, []);
});

// Seller orders view (orders referencing products that belong to seller)
router.get('/seller', protect, requireRoles('SELLER'), (req, res) => {
  const sellerId = req.user._id.toString();
  const sellerOrders = ordersStore.filter((o) =>
    Array.isArray(o.items) && o.items.some((it) => it.product && it.product.sellerId === sellerId)
  ).map((o) => ({
    id: o.id,
    status: o.status,
    created_at: o.created_at,
    total_items: o.items.length,
    items: o.items.filter((it) => it.product && it.product.sellerId === sellerId),
  }));
  return sendSuccess(res, sellerOrders);
});

// Admin orders list
router.get('/admin', protect, requireRoles('ADMIN'), (req, res) => {
  return sendSuccess(res, ordersStore);
});

module.exports = router;


