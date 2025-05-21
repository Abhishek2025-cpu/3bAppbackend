const express = require('express');
const router = express.Router();
const feedbackController = require('../Controllers/feedbackController');

router.post('/add-feedback', feedbackController.createFeedback);
router.get('/get-feedbacks', feedbackController.getPublicFeedbacks);

module.exports = router;
