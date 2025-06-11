const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  theme: String,
  question: String,
  userAnswer: String,
  correctAnswer: String,
  score: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Answer', answerSchema);
