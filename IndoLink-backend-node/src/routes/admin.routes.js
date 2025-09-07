const { Router } = require('express');
const { protect, requireRoles } = require('../middleware/auth');
const Product = require('../models/product.model');
const { sendSuccess } = require('../utils/response');

const router = Router();

router.get('/stats', protect, requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const [totalProducts, active, sold] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ status: 'ACTIVE' }),
      Product.countDocuments({ status: 'SOLD' }),
    ]);
    return sendSuccess(res, { totalProducts, active, sold });
  } catch (err) { next(err); }
});

module.exports = router;


