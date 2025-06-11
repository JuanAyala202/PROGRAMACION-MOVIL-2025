const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const Answer = require('./models/Answer');

// Configuración de dotenv
dotenv.config();  // Asegura que las variables de entorno estén disponibles

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch((error) => console.log(error));

const app = express();
app.use(express.json());
app.use(cors());

// Función para generar preguntas con OpenAI usando axios
const generateQuestions = async (theme) => {
  const prompt = `Genera 5 preguntas de opción múltiple sobre el tema ${theme}, con 3 opciones (A, B, C) y la respuesta correcta.`;

  try {
    // Realiza la solicitud a OpenAI con la clave API de forma correcta
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,  // Usa la clave API desde el .env
        'Content-Type': 'application/json',
      }
    });

    console.log('Respuesta de OpenAI:', response.data);  // Para verificar la respuesta
    // Formateamos las preguntas de la respuesta
    const questions = response.data.choices[0].message.content.split('\n').map((item) => {
      const parts = item.split(':');
      if (parts.length === 2) {
        return {
          question: parts[0].trim(),
          options: parts[1].trim().split(','),
          answer: parts[1].trim().split(',')[0],  // Consideramos la primera opción como la correcta
        };
      }
      return null;
    }).filter(Boolean);

    return questions;
  } catch (error) {
    console.error('Error generando las preguntas:', error);
    return [];
  }
};

// Ruta para obtener las preguntas por tema
app.get('/questions/:theme', async (req, res) => {
  const theme = req.params.theme;
  const questions = await generateQuestions(theme);
  if (questions.length > 0) {
    res.json(questions);
  } else {
    res.status(400).json({ error: 'No se pudieron generar preguntas' });
  }
});

// Ruta para guardar las respuestas
app.post('/save-answer', async (req, res) => {
  const { theme, question, userAnswer, correctAnswer, score } = req.body;
  const newAnswer = new Answer({ theme, question, userAnswer, correctAnswer, score });
  try {
    await newAnswer.save();
    res.status(201).json({ message: 'Respuesta guardada con éxito' });
  } catch (error) {
    res.status(400).json({ error: 'Error al guardar la respuesta' });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
