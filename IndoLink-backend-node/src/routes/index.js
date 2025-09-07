const { Router } = require('express');
const productRoutes = require('./product.routes');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const analyticsRoutes = require('./analytics.routes');
const ordersRoutes = require('./orders.routes');

const router = Router();

router.use('/products', productRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/orders', ordersRoutes);

module.exports = router;


