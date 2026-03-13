require('dotenv').config();
const mongoose = require('mongoose');
const UsuarioService = require('./services/UsuarioService');

async function plantarSemente() {
    try {
        console.log('Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado com sucesso!');

        const dadosAdmin = {
            nome: 'Gerente',
            email: 'admin@borbolelala.com',
            senha: 'senhaSegura123',
            role: 'admin'
        };

        console.log('Criando o primeiro usuário Admin...');
        const adminCriado = await UsuarioService.registrar(dadosAdmin);
        
        console.log('Semente plantada com sucesso! O primeiro acesso já pode ser feito.');
        console.log(`Nome: ${adminCriado.nome} | Email: ${adminCriado.email}`);

        process.exit(0);

    } catch (error) {
        console.error('Erro ao rodar o Seed:', error.message);
        process.exit(1);
    }
}

plantarSemente();