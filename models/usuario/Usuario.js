const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'O nome é obrigatório']
    },
    email: {
        type: String,
        required: [true, 'O email é obrigatório'],
        unique: true, 
        lowercase: true
    },
    senha: {
        type: String,
        required: [true, 'A senha é obrigatória'],
        select: false 
    },
    role: {
        type: String,
        enum: ['admin', 'vendedor'], 
        default: 'vendedor'
    }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);