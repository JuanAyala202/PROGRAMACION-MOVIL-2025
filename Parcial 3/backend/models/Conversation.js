const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: String,      // 'user' o 'assistant'
  content: String,
  timestamp: { type: Date, default: Date.now }
});

const ConversationSchema = new mongoose.Schema({
  userId: String, // puedes usar IP, UUID, email, etc.
  messages: [MessageSchema]
});

module.exports = mongoose.model('Conversation', ConversationSchema);
