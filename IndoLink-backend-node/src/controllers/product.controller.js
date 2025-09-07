const createError = require('http-errors');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const { sendSuccess } = require('../utils/response');

async function listCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ created_at: -1 });
    return sendSuccess(res, categories);
  } catch (err) { next(err); }
}

async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;
    const exists = await Category.findOne({ name });
    if (exists) throw createError(409, 'Category already exists');
    const category = await Category.create({ name, description });
    return sendSuccess(res, category, 201);
  } catch (err) { next(err); }
}

async function listProducts(req, res, next) {
  try {
    const products = await Product.find().populate('category').sort({ created_at: -1 });
    return sendSuccess(res, products);
  } catch (err) { next(err); }
}

async function createProduct(req, res, next) {
  try {
    const payload = { ...req.body };
    // Normalize category and numeric fields
    if (payload.category && typeof payload.category === 'string') {
      payload.category = payload.category;
    }
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.quantity !== undefined) payload.quantity = Number(payload.quantity);
    if (Number.isNaN(payload.price) || payload.price <= 0) {
      throw createError(400, 'Invalid price');
    }
    if (!Number.isInteger(payload.quantity) || payload.quantity <= 0) {
      throw createError(400, 'Invalid quantity');
    }
    // Attach primary image if uploaded
    if (req.file) {
      payload.image = `/uploads/${req.file.filename}`;
    }
    if (!payload.seller && req.user) {
      payload.seller = req.user._id;
    }
    if (!payload.seller) throw createError(400, 'seller is required');
    const product = await Product.create(payload);
    return sendSuccess(res, product, 201);
  } catch (err) { next(err); }
}

async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) throw createError(404, 'Product not found');
    return sendSuccess(res, product);
  } catch (err) { next(err); }
}

async function getSellerProducts(req, res, next) {
  try {
    const { seller } = req.query;
    let query = {};
    if (req.user && req.user.role === 'SELLER') {
      query = { seller: req.user._id };
    } else if (seller) {
      query = { seller };
    } else if (req.user && req.user.role === 'ADMIN') {
      // Admin views products listed by sellers that are not yet re-listed by admin
      query = { admin: { $exists: false }, status: { $in: ['DRAFT', 'ACTIVE'] } };
    }
    const products = await Product.find(query)
      .populate('category')
      .populate('seller')
      .sort({ created_at: -1 })
      .lean();
    const mapped = products.map((p) => ({
      id: p._id,
      name: p.name,
      description: p.description,
      category_name: p.category?.name,
      price: p.price,
      quantity: p.quantity,
      status: p.status,
      seller_name: p.seller?.username,
      image: p.image,
      primary_image: Array.isArray(p.images) ? (p.images.find((img) => img.isPrimary)?.imageUrl || p.images[0]?.imageUrl) : undefined,
    }));
    return sendSuccess(res, mapped);
  } catch (err) { next(err); }
}

async function adminPurchaseProduct(req, res, next) {
  try {
    const { id } = req.params;
    const updates = { status: 'INACTIVE' };
    if (req.user) updates.admin = req.user._id;
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) throw createError(404, 'Product not found');
    return sendSuccess(res, product);
  } catch (err) { next(err); }
}

async function adminRelistProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { relist_price } = req.body;
    const updates = { status: 'ACTIVE' };
    if (relist_price !== undefined) updates.relist_price = Number(relist_price);
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) throw createError(404, 'Product not found');
    return sendSuccess(res, product);
  } catch (err) { next(err); }
}

async function getSellerStats(req, res, next) {
  try {
    let { seller } = req.query;
    if (!seller && req.user) seller = req.user._id;
    const total_products = await Product.countDocuments({ seller });
    const active_products = await Product.countDocuments({ seller, status: 'ACTIVE' });
    const sold_products = await Product.countDocuments({ seller, status: 'SOLD' });
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const recent_products = await Product.countDocuments({ seller, created_at: { $gte: since } });
    // Placeholder values until orders/ratings implemented
    const total_sales = 0;
    const total_orders = 0;
    const average_rating = 0;
    return sendSuccess(res, {
      total_products,
      active_products,
      sold_products,
      recent_products,
      total_sales,
      total_orders,
      average_rating,
    });
  } catch (err) { next(err); }
}

async function uploadProductImage(req, res, next) {
  try {
    const { id } = req.params;
    if (!req.file) throw createError(400, 'No file uploaded');
    const imageUrl = `/uploads/${req.file.filename}`;
    const updated = await Product.findByIdAndUpdate(
      id,
      { $push: { images: { imageUrl } } },
      { new: true }
    );
    if (!updated) throw createError(404, 'Product not found');
    return sendSuccess(res, updated);
  } catch (err) { next(err); }
}

async function deleteProductImage(req, res, next) {
  try {
    const { id, imageId } = req.params;
    const updated = await Product.findByIdAndUpdate(
      id,
      { $pull: { images: { _id: imageId } } },
      { new: true }
    );
    if (!updated) throw createError(404, 'Product not found');
    return sendSuccess(res, updated);
  } catch (err) { next(err); }
}

module.exports = {
  listCategories,
  createCategory,
  listProducts,
  createProduct,
  getProductById,
  getSellerProducts,
  adminPurchaseProduct,
  adminRelistProduct,
  getSellerStats,
  uploadProductImage,
  deleteProductImage,
  // Newly added export
  updateProduct: async function updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      if (updates.price) updates.price = Number(updates.price);
      if (updates.quantity) updates.quantity = Number(updates.quantity);
      if (req.file) {
        updates.image = `/uploads/${req.file.filename}`;
      }
      const product = await Product.findByIdAndUpdate(id, updates, { new: true });
      if (!product) throw createError(404, 'Product not found');
      return sendSuccess(res, product);
    } catch (err) { next(err); }
  },
};


