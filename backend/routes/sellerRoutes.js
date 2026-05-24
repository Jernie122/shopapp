const express = require('express');
const router = express.Router();
const SellerApplication = require('../models/SellerApplication');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

// APPLY to become a seller
router.post('/apply', protect, async (req, res) => {
  try {
    if (req.user.role === 'seller') {
      return res.status(400).json({ message: 'You are already a seller' });
    }
    if (req.user.role === 'admin') {
      return res.status(400).json({ message: 'Admins cannot apply as sellers' });
    }

    const existing = await SellerApplication.findOne({
      user: req.user._id,
      status: 'pending'
    });

    if (existing) {
      return res.status(400).json({ message: 'You already have a pending application' });
    }

    const { storeName, storeDescription, phone, address } = req.body;

    const application = await SellerApplication.create({
      user: req.user._id,
      storeName,
      storeDescription,
      phone,
      address
    });

    res.status(201).json({
      message: 'Application submitted successfully!',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET my application status
router.get('/my-application', protect, async (req, res) => {
  try {
    const application = await SellerApplication.findOne({
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET seller's own products
router.get('/my-products', protect, async (req, res) => {
  try {
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const products = await Product.find({ seller: req.user._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET seller's orders (orders containing seller's products)
router.get('/my-orders', protect, async (req, res) => {
  try {
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const myProducts = await Product.find({ seller: req.user._id });
    const myProductIds = myProducts.map(p => p._id.toString());

    const orders = await Order.find({})
      .populate('buyer', 'name email')
      .populate('items.product', 'name image price');

    const sellerOrders = orders.filter(order =>
      order.items.some(item =>
        item.product && myProductIds.includes(item.product._id.toString())
      )
    );

    res.json(sellerOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;