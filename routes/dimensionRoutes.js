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
// POST multiple dimensions from comma-separated string
router.post('/add-dimensions', async (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ error: 'No dimension value provided.' });

  const dimensions = value.split(',').map(dim => dim.trim()).filter(dim => dim.length > 0);
  const inserted = [];

  for (let dim of dimensions) {
    const exists = await Dimension.findOne({ value: dim });
    if (!exists) {
      const newDim = new Dimension({ value: dim });
      await newDim.save();
      inserted.push(newDim);
    }
  }

  const allDims = await Dimension.find().sort({ value: 1 });
  res.json({ message: 'Dimensions added successfully.', added: inserted, all: allDims });
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
