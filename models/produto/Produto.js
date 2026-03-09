const mongoose = require('mongoose');

const ProdutoSchema = new mongoose.Schema({
    id: { 
        type: Number, 
        required: true, 
        unique: true 
    },
    nome: { 
        type: String, 
        required: true 
    },
    categoria: { 
        type: String, 
        required: true 
    },
    quantidade: { 
        type: Number, 
        required: true,
        default: 0 
    },
    preco: { 
        type: Number, 
        required: true,
        default: 0 
    },
    precoVenda: { 
        type: Number, 
        required: false, 
        default: 0 
    },
    tamanhos: {
        type: [String], 
        default: ['U']  
    }
}, {
    versionKey: false 
});

module.exports = mongoose.model('Produto', ProdutoSchema);