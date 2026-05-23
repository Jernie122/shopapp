const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: String,
      image: String,
      price: Number,
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    province: String,
    zipCode: String,
    phone: String
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);