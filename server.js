// ==========================================
// server.js - Ponto de Entrada do Backend
// ==========================================
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// IMPORTAÇÃO DAS ROTAS
const produtoRoutes = require('./routes/produtoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const freteRoutes = require('./routes/freteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middlewares
app.use(cors()); 
app.use(express.json()); 

// 2. Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
    .catch((erro) => console.error('❌ Erro ao conectar no MongoDB:', erro.message));

// 3. Sincronização com o Frontend
const pastaClient = path.join(__dirname, 'client');
app.use(express.static(pastaClient));

// 4. ROTAS DA API (Padrão MVC)
app.use('/api', produtoRoutes);
app.use('/api', pedidoRoutes);
app.use('/api', freteRoutes);

// 5. Rota de fallback (Sempre no final)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(pastaClient, 'index.html'));
});

// 6. Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`🦋 Servidor Borbolêlalá rodando na porta ${PORT}`);
    console.log(`👉 Acesse: http://localhost:${PORT}`);
});