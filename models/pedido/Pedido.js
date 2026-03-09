const mongoose = require('mongoose');

// 1. Sub-esquema para organizar os itens dentro do carrinho
const ItemPedidoSchema = new mongoose.Schema({
    produtoId: { 
        type: Number,
        required: true 
    },
    nome: { 
        type: String, 
        required: true 
    },
    quantidade: { 
        type: Number, 
        required: true,
        min: [1, 'A quantidade mínima é 1']
    },
    precoUnitario: { 
        type: Number, 
        required: true 
    },
    subtotal: { 
        type: Number, 
        required: true 
    }
}, { 
    _id: false 
});

// 2. Esquema Principal do Pedido
const PedidoSchema = new mongoose.Schema({
    cliente: {
        type: String,
        required: true,
        trim: true 
    },
    endereco: {
        cep: { type: String, required: true },
        logradouro: { type: String, required: true },
        bairro: { type: String },
        cidade: { type: String, required: true },
        estado: { type: String, required: true }
    },
    itens: [ItemPedidoSchema],
    totalFinal: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Pendente', 'Pago', 'Enviado', 'Cancelado'], 
        default: 'Pendente'
    }
}, {
    versionKey: false,
    timestamps: true
});

// O Mongoose criará uma coleção chamada 'pedidos' automaticamente
module.exports = mongoose.model('Pedido', PedidoSchema);