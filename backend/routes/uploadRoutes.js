const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/authMiddleware');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Single image upload
router.post('/', protect, async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const file = req.files.image;
    const b64 = file.data.toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'shopapp',
      transformation: [{ width: 800, height: 800, crop: 'limit' }]
    });

    res.json({
      message: 'Image uploaded successfully!',
      imageUrl: result.secure_url
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Multiple images upload
router.post('/multiple', protect, async (req, res) => {
  try {
    if (!req.files || !req.files.images) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const files = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];

    if (files.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 images allowed' });
    }

    const uploadPromises = files.map(async (file) => {
      const b64 = file.data.toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'shopapp',
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
      });
      return result.secure_url;
    });

    const imageUrls = await Promise.all(uploadPromises);

    res.json({
      message: 'Images uploaded successfully!',
      imageUrls
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;