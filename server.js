// ==========================================
// server.js - Ponto de Entrada do Backend
// ==========================================
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Produto = require('./models/produto/Produto');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middlewares (Os "filtros" do Express)
app.use(cors()); 
app.use(express.json()); 

// 2. Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Conectado ao MongoDB com sucesso! (Base de Estoque/Vendas)');
    })
    .catch((erro) => {
        console.error('❌ Erro ao conectar no MongoDB:', erro.message);
    });

// 3. Sincronização com o Frontend
const pastaClient = path.join(__dirname, 'client');
app.use(express.static(pastaClient));

// 4. Modelos Mongoose (Definição de Esquemas)
app.get('/api/produtos', async (req, res) => {
    try {
        const produtosDoBanco = await Produto.find();
        res.json(produtosDoBanco); 
    } catch (error) {
        console.error("Erro na API de produtos:", error);
        res.status(500).json({ erro: 'Falha ao buscar o catálogo' });
    }
});

// Rota de fallback: Se o usuário digitar qualquer URL que não seja uma API, manda pro index.html
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(pastaClient, 'index.html'));
});

// 5. Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`🦋 Servidor Borbolêlalá rodando na porta ${PORT}`);
    console.log(`👉 Acesse: http://localhost:${PORT}`);
});