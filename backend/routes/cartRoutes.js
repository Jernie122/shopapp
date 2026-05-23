const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Product = require('../models/Product');

let carts = {};

// GET cart
router.get('/', protect, (req, res) => {
  const userId = req.user._id.toString();
  const cart = carts[userId] || [];
  res.json(cart);
});

// ADD to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id.toString();

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!carts[userId]) {
      carts[userId] = [];
    }

    const existingItem = carts[userId].find(
      item => item.productId === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      carts[userId].push({
        productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity || 1
      });
    }

    res.json(carts[userId]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// REMOVE from cart
router.delete('/remove/:productId', protect, (req, res) => {
  const userId = req.user._id.toString();
  const { productId } = req.params;

  if (carts[userId]) {
    carts[userId] = carts[userId].filter(
      item => item.productId !== productId
    );
  }

  res.json(carts[userId] || []);
});

// CLEAR cart
router.delete('/clear', protect, (req, res) => {
  const userId = req.user._id.toString();
  carts[userId] = [];
  res.json({ message: 'Cart cleared' });
});

module.exports = router;