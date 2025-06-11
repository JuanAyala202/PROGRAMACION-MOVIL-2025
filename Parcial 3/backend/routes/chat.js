const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const Conversation = require('../models/Conversation');
const authenticateToken = require('../middleware/auth');
const SYSTEM_PROMPT = require('../config/prompt');

// Inicializa OpenAI con tu API key directamente (mejor usar .env en producción)
const openai = new OpenAI({
  apiKey: '',
});

// Ruta protegida con token
router.post('/', authenticateToken, async (req, res) => {
  const { message } = req.body;
  const userId = req.userId; // viene del token JWT

  try {
    // Buscar o crear conversación por usuario
    let convo = await Conversation.findOne({ userId });
    if (!convo) convo = new Conversation({ userId, messages: [] });

    // Agregar el mensaje del usuario
    convo.messages.push({ role: 'user', content: message });

    // Enviar todo el historial a OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...convo.messages,
      ],
    });

    const reply = completion.choices[0].message.content;

    // Agregar la respuesta del bot y guardar
    convo.messages.push({ role: 'assistant', content: reply });
    await convo.save();

    res.json({ reply });
  } catch (error) {
    console.error('❌ Error al procesar el chat:', error);
    res.status(500).json({ error: 'Error en el servidor de chatbot' });
  }
});

module.exports = router;
