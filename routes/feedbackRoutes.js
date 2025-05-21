const express = require('express');
const router = express.Router();
const feedbackController = require('../Controllers/feedbackController');

router.post('/feedback', feedbackController.createFeedback);
router.get('/feedbacks', feedbackController.getPublicFeedbacks);

module.exports = router;
