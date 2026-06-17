const Usuario = require('../../models/usuario/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioService = require('../../services/UsuarioService');

jest.mock('../../models/usuario/Usuario');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('UsuarioService - Testes Unitários', () => {

    beforeAll(() => {
        process.env.JWT_SECRET = 'segredo-teste';
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // TESTES DO MÉTODO: registrar
    // ==========================================
    it('Deve registrar um novo usuário com sucesso', async () => {
        const dadosEntrada = { nome: 'Christian', email: 'teste@email.com', senha: '123', role: 'admin' };

        Usuario.findOne.mockResolvedValue(null);

        bcrypt.genSalt.mockResolvedValue('salt-falso');
        bcrypt.hash.mockResolvedValue('senha-criptografada');

        const saveMock = jest.fn().mockResolvedValue();
        Usuario.mockImplementation(() => ({
            nome: dadosEntrada.nome,
            email: dadosEntrada.email,
            senha: 'senha-criptografada',
            role: dadosEntrada.role,
            save: saveMock
        }));

        const resultado = await UsuarioService.registrar(dadosEntrada);

        expect(Usuario.findOne).toHaveBeenCalledWith({ email: 'teste@email.com' });
        expect(bcrypt.hash).toHaveBeenCalledWith('123', 'salt-falso');
        expect(saveMock).toHaveBeenCalledTimes(1);
        expect(resultado.senha).toBeUndefined();
        expect(resultado.nome).toBe('Christian');
    });

    it('Deve lançar erro ao tentar registrar um email que já existe', async () => {
        Usuario.findOne.mockResolvedValue({ email: 'teste@email.com' });

        await expect(UsuarioService.registrar({ email: 'teste@email.com' }))
            .rejects.toThrow('Este email já está cadastrado.');

        expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    // ==========================================
    // TESTES DO MÉTODO: login
    // ==========================================
    it('Deve realizar login com sucesso e retornar o token', async () => {
        const mockUsuarioBanco = {
            _id: '12345',
            nome: 'Christian',
            email: 'teste@email.com',
            senha: 'senha-hash',
            role: 'admin'
        };

        Usuario.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUsuarioBanco)
        });

        bcrypt.compare.mockResolvedValue(true);

        jwt.sign.mockReturnValue('token-jwt-falso');

        const resultado = await UsuarioService.login({ email: 'teste@email.com', senha: '123' });

        expect(Usuario.findOne).toHaveBeenCalledWith({ email: 'teste@email.com' });
        expect(bcrypt.compare).toHaveBeenCalledWith('123', 'senha-hash');
        expect(jwt.sign).toHaveBeenCalledWith(
            { id: '12345', role: 'admin' },
            'segredo-teste',
            { expiresIn: '8h' }
        );
        expect(resultado.mensagem).toBe('Login realizado com sucesso!');
        expect(resultado.token).toBe('token-jwt-falso');
        expect(resultado.usuario.id).toBe('12345');
        expect(resultado.usuario.senha).toBeUndefined();
    });

    it('Deve lançar erro de login se o email não for encontrado', async () => {
        Usuario.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });

        await expect(UsuarioService.login({ email: 'errado@email.com', senha: '123' }))
            .rejects.toThrow('Email ou senha incorretos.');

        expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('Deve lançar erro de login se a senha estiver incorreta', async () => {
        Usuario.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue({ senha: 'senha-hash' })
        });

        bcrypt.compare.mockResolvedValue(false);

        await expect(UsuarioService.login({ email: 'teste@email.com', senha: 'senha-errada' }))
            .rejects.toThrow('Email ou senha incorretos.');

        expect(jwt.sign).not.toHaveBeenCalled();
    });
});