const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

// GET all reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a review
router.post('/:productId', protect, async (req, res) => {
  try {
    const rating = Number(req.body.rating)
    const { comment } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide a valid rating' })
    }

    const alreadyReviewed = await Review.findOne({
      product: req.params.productId,
      user: req.user._id
    })

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You already reviewed this product' })
    }

    const orders = await Order.find({
      buyer: req.user._id,
      status: 'delivered'
    })

    const hasDelivered = orders.some(order =>
      order.items.some(item =>
        item.product?.toString() === req.params.productId
      )
    )

    if (!hasDelivered) {
      return res.status(400).json({ message: 'You can only review products after they are delivered' })
    }

    const newReview = await Review.create({
      product: req.params.productId,
      user: req.user._id,
      name: req.user.name,
      rating,
      comment
    })

    const allReviews = await Review.find({ product: req.params.productId })
    const total = allReviews.reduce((sum, r) => sum + Number(r.rating), 0)
    const avg = allReviews.length > 0 ? total / allReviews.length : 0

    await Product.findByIdAndUpdate(req.params.productId, {
      ratings: Number(avg.toFixed(1)),
      numReviews: allReviews.length
    })

    res.status(201).json({ message: 'Review added!', review: newReview })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
});

// DELETE a review
router.delete('/:productId/:reviewId', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await review.deleteOne();

    const allReviews = await Review.find({ product: req.params.productId })
    const total = allReviews.reduce((sum, r) => sum + Number(r.rating), 0)
    const avg = allReviews.length > 0 ? total / allReviews.length : 0

    await Product.findByIdAndUpdate(req.params.productId, {
      ratings: Number(avg.toFixed(1)),
      numReviews: allReviews.length
    })

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;