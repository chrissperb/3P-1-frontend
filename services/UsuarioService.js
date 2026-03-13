const Usuario = require('../models/usuario/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UsuarioService {
    
    static async registrar({ nome, email, senha, role }) {
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) throw new Error('Este email já está cadastrado.');

        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const novoUsuario = new Usuario({
            nome,
            email,
            senha: senhaCriptografada,
            role
        });

        await novoUsuario.save();
        
        novoUsuario.senha = undefined;
        return novoUsuario;
    }

    static async login({ email, senha }) {
        const usuario = await Usuario.findOne({ email }).select('+senha');
        if (!usuario) throw new Error('Email ou senha incorretos.');

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) throw new Error('Email ou senha incorretos.');

        const token = jwt.sign(
            { id: usuario._id, role: usuario.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' }
        );

        return {
            mensagem: 'Login realizado com sucesso!',
            token,
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role
            }
        };
    }
}

module.exports = UsuarioService;