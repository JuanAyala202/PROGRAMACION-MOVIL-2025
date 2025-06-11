const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Carga .env (opcional, útil si luego usas claves desde allí)
dotenv.config();

const chatRoute = require('./routes/chat');
const authRoute = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://juanstebanknow:1234567jj@cluster0.vtvcnnf.mongodb.net/chatbot?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('🟢 MongoDB conectado'))
  .catch((err) => console.error('🔴 Error conectando MongoDB:', err));

// 📦 Rutas
app.use('/api/chat', chatRoute);     // Protegido por token
app.use('/api/auth', authRoute);     // Registro/Login

// 🚀 Arranca servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
