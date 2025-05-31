const mongoose = require('mongoose');

const feedbackFormSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, default: null },

  applicationUI: { type: Number, required: true, min: 1, max: 5 },
  applicationFunctions: { type: Number, required: true, min: 1, max: 5 },
  colorCombination: { type: Number, required: true, min: 1, max: 5 },
  uxExperience: { type: Number, required: true, min: 1, max: 5 },
  loadingSpeed: { type: Number, required: true, min: 1, max: 5 },
  navigationFlow: { type: Number, required: true, min: 1, max: 5 },
  errorHandling: { type: Number, required: true, min: 1, max: 5 },
  featureCompleteness: { type: Number, required: true, min: 1, max: 5 },
  clarityOfInformation: { type: Number, required: true, min: 1, max: 5 },
  accessibility: { type: Number, required: true, min: 1, max: 5 },

  review: { type: String, default: null },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FeedbackForm', feedbackFormSchema);
