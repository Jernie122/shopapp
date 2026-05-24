const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const SellerApplication = require('../models/SellerApplication');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// GET dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'buyer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const pendingApplications = await SellerApplication.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      pendingApplications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SUSPEND/UNSUSPEND user
router.put('/users/:id/suspend', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isSuspended = !user.isSuspended;
    await user.save();
    res.json({ message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE user
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all seller applications
router.get('/applications', protect, adminOnly, async (req, res) => {
  try {
    const applications = await SellerApplication.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// APPROVE seller application
router.put('/applications/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const application = await SellerApplication.findById(req.params.id)
      .populate('user');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = 'approved';
    await application.save();

    await User.findByIdAndUpdate(application.user._id, {
      role: 'seller',
      storeName: application.storeName,
      storeDescription: application.storeDescription,
      phone: application.phone
    });

    res.json({ message: 'Application approved! User is now a seller.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// REJECT seller application
router.put('/applications/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const application = await SellerApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = 'rejected';
    application.rejectionReason = req.body.reason || 'Application rejected';
    await application.save();

    res.json({ message: 'Application rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all products
router.get('/products', protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find({}).populate('seller', 'name email storeName');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE product
router.delete('/products/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all orders
router.get('/orders', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('buyer', 'name email')
      .populate('items.product', 'name image');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE order status
router.put('/orders/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = req.body.status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;