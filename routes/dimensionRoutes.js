// routes/dimensionRoutes.js
const express = require('express');
const router = express.Router();
const Dimension = require('../models/Dimension');

// GET all dimensions
router.get('/get-dimensions', async (req, res) => {
  try {
    const dimensions = await Dimension.find().sort({ value: 1 });
    res.json(dimensions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD a new dimension
router.post('/add-dimensions', async (req, res) => {
  const { value } = req.body;
  try {
    const exists = await Dimension.findOne({ value });
    if (exists) return res.status(400).json({ error: 'Dimension already exists.' });
    const dimension = new Dimension({ value });
    await dimension.save();
    res.json(dimension);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a dimension
router.delete('/delete-dimensions:id', async (req, res) => {
  try {
    await Dimension.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
