// ==========================================
// server.js - Ponto de Entrada do Backend
// ==========================================
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const errorHandler = require('./middlewares/errorHandler');

// IMPORTAÇÃO DAS ROTAS
const produtoRoutes = require('./routes/produtoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const freteRoutes = require('./routes/freteRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Borbolêlalá PDV',
            version: '1.0.0',
            description: 'Documentação oficial da API de Frente de Caixa e Gestão de Estoque.',
        },
        servers: [
            { url: 'http://localhost:3000' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// 1. Middlewares
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 2. Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado ao MongoDB com sucesso!'))
    .catch((erro) => console.error('Erro ao conectar no MongoDB:', erro.message));

// 3. Sincronização com o Frontend
app.get('/', (req, res) => {
    res.json({
        status: "online",
        mensagem: "API da Borbolêlalá rodando com sucesso.",
        versao: "1.0.0"
    });
});

// 4. ROTAS DA API (Padrão MVC)
app.use('/api', produtoRoutes);
app.use('/api', pedidoRoutes);
app.use('/api', freteRoutes);
app.use('/api', usuarioRoutes);
app.use(errorHandler);

// 5. Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});