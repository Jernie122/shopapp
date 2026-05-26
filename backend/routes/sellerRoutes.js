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
// UPDATE order status (seller approves/processes)
router.put('/orders/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = req.body.status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET seller analytics
router.get('/analytics', protect, async (req, res) => {
  try {
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const myProducts = await Product.find({ seller: req.user._id })
    const myProductIds = myProducts.map(p => p._id.toString())

    const allOrders = await Order.find({})
      .populate('buyer', 'name email')
      .populate('items.product', 'name image price')

    const sellerOrders = allOrders.filter(order =>
      order.items.some(item =>
        item.product && myProductIds.includes(item.product._id.toString())
      )
    )

    // Sales last 7 days
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
      const dayOrders = sellerOrders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate.toDateString() === date.toDateString()
      })
      const revenue = dayOrders.reduce((sum, o) => sum + o.totalPrice, 0)
      last7Days.push({ date: dateStr, orders: dayOrders.length, revenue })
    }

    // Top products
    const productSales = {}
    sellerOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product && myProductIds.includes(item.product._id.toString())) {
          const pid = item.product._id.toString()
          if (!productSales[pid]) {
            productSales[pid] = {
              name: item.product.name,
              image: item.product.image,
              totalSold: 0,
              totalRevenue: 0
            }
          }
          productSales[pid].totalSold += item.quantity
          productSales[pid].totalRevenue += item.price * item.quantity
        }
      })
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)

    // Order status breakdown
    const statusBreakdown = [
      { name: 'Pending', value: sellerOrders.filter(o => o.status === 'pending').length, color: '#f5b042' },
      { name: 'Processing', value: sellerOrders.filter(o => o.status === 'processing').length, color: '#60a5fa' },
      { name: 'Shipped', value: sellerOrders.filter(o => o.status === 'shipped').length, color: '#a78bfa' },
      { name: 'Delivered', value: sellerOrders.filter(o => o.status === 'delivered').length, color: '#34d399' },
      { name: 'Cancelled', value: sellerOrders.filter(o => o.status === 'cancelled').length, color: '#f87171' }
    ].filter(s => s.value > 0)

    // Unique customers
    const uniqueCustomers = new Set(sellerOrders.map(o => o.buyer?._id?.toString())).size

    res.json({
      last7Days,
      topProducts,
      statusBreakdown,
      uniqueCustomers,
      totalRevenue: sellerOrders.reduce((sum, o) => sum + o.totalPrice, 0),
      totalOrders: sellerOrders.length,
      totalProducts: myProducts.length
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router;