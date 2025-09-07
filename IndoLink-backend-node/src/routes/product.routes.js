const { Router } = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const controller = require('../controllers/product.controller');
const { protect, requireRoles } = require('../middleware/auth');

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  try { fs.mkdirSync(uploadDir, { recursive: true }); } catch (e) { /* noop */ }
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const base = path
      .basename(file.originalname || `file${Date.now()}`, ext)
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});
const upload = multer({ storage });

router.get('/categories', controller.listCategories);
router.get('/categories/', controller.listCategories);
router.post('/categories', protect, requireRoles('ADMIN'), controller.createCategory);
router.post('/categories/', protect, requireRoles('ADMIN'), controller.createCategory);

router.get('/seller-products', protect, requireRoles('SELLER', 'ADMIN'), controller.getSellerProducts);
router.get('/seller-products/', protect, requireRoles('SELLER', 'ADMIN'), controller.getSellerProducts);
router.post('/:id/admin-purchase', protect, requireRoles('ADMIN'), controller.adminPurchaseProduct);
router.post('/:id/admin-purchase/', protect, requireRoles('ADMIN'), controller.adminPurchaseProduct);
router.post('/:id/admin-relist', protect, requireRoles('ADMIN'), controller.adminRelistProduct);
router.post('/:id/admin-relist/', protect, requireRoles('ADMIN'), controller.adminRelistProduct);
router.get('/seller/stats', protect, requireRoles('SELLER'), controller.getSellerStats);
router.get('/seller/stats/', protect, requireRoles('SELLER'), controller.getSellerStats);

router.post('/:id/images', protect, requireRoles('SELLER', 'ADMIN'), upload.single('image'), controller.uploadProductImage);
router.post('/:id/images/', protect, requireRoles('SELLER', 'ADMIN'), upload.single('image'), controller.uploadProductImage);
router.delete('/:id/images/:imageId', protect, requireRoles('SELLER', 'ADMIN'), controller.deleteProductImage);
router.delete('/:id/images/:imageId/', protect, requireRoles('SELLER', 'ADMIN'), controller.deleteProductImage);

router.get('/', controller.listProducts);
router.get('/', controller.listProducts);
router.post('/', protect, requireRoles('SELLER', 'ADMIN'), upload.single('image'), controller.createProduct);
router.post('/', protect, requireRoles('SELLER', 'ADMIN'), upload.single('image'), controller.createProduct);
router.get('/:id', controller.getProductById);
router.get('/:id/', controller.getProductById);

// Optional: delete product to match frontend attempt
router.delete('/:id', protect, requireRoles('SELLER', 'ADMIN'), async (req, res, next) => {
  try {
    const deleted = await require('../models/product.model').findByIdAndDelete(req.params.id);
    if (!deleted) return next(require('http-errors')(404, 'Product not found'));
    return require('../utils/response').sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
});
router.delete('/:id/', protect, requireRoles('SELLER', 'ADMIN'), async (req, res, next) => {
  try {
    const deleted = await require('../models/product.model').findByIdAndDelete(req.params.id);
    if (!deleted) return next(require('http-errors')(404, 'Product not found'));
    return require('../utils/response').sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
});

// Update endpoint (PATCH) for editing product
router.patch('/:id', protect, requireRoles('SELLER', 'ADMIN'), upload.single('image'), controller.updateProduct);
router.patch('/:id/', protect, requireRoles('SELLER', 'ADMIN'), upload.single('image'), controller.updateProduct);

module.exports = router;


