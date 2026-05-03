const UsuarioService = require('../services/UsuarioService');

class UsuarioController {

    static async login(req, res) {
        try {
            const resposta = await UsuarioService.login(req.body);
            res.status(200).json(resposta);
        } catch (error) {
            res.status(401).json({ erro: error.message });
        }
    }

    static async registrar(req, res) {
        try {
            const novoUsuario = await UsuarioService.registrar(req.body);
            res.status(201).json({ mensagem: 'Usuário criado com sucesso!', usuario: novoUsuario });
        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    }
}

module.exports = UsuarioController;