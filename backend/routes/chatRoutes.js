const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// GET all conversations for current user
router.get('/conversations', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'name role storeName')
    .populate('receiver', 'name role storeName')
    .populate('product', 'name image')
    .sort({ createdAt: -1 });

    // Group by conversation
    const conversationMap = {};
    messages.forEach(msg => {
      if (!conversationMap[msg.conversation]) {
        conversationMap[msg.conversation] = {
          conversationId: msg.conversation,
          product: msg.product,
          lastMessage: msg,
          unread: 0,
          otherUser: msg.sender._id.toString() === req.user._id.toString()
            ? msg.receiver : msg.sender
        };
      }
      if (!msg.isRead && msg.receiver._id.toString() === req.user._id.toString()) {
        conversationMap[msg.conversation].unread++;
      }
    });

    res.json(Object.values(conversationMap));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET messages in a conversation
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId
    })
    .populate('sender', 'name role storeName')
    .populate('product', 'name image price')
    .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { conversation: req.params.conversationId, receiver: req.user._id },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SEND a message
router.post('/send', protect, async (req, res) => {
  try {
    const { receiverId, message, productId } = req.body;

    // Create conversation ID from two user IDs + product
    const ids = [req.user._id.toString(), receiverId].sort();
    const conversationId = productId
      ? `${ids[0]}_${ids[1]}_${productId}`
      : `${ids[0]}_${ids[1]}`;

    const newMessage = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      receiver: receiverId,
      product: productId || null,
      message
    });

    const populated = await Message.findById(newMessage._id)
      .populate('sender', 'name role storeName')
      .populate('product', 'name image price');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET unread count
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;