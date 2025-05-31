const express = require('express');
const router = express.Router();
const Feedback = require('../models/FeedbackForm');

// POST /api/submit-feedback
router.post('/submit-feedback', async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error submitting feedback', details: error.message });
  }
});

// GET /api/get-feedbacks
router.get('/get-feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ submittedAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching feedbacks', details: error.message });
  }
});

module.exports = router;
