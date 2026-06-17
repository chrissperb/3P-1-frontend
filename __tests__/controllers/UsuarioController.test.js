const UsuarioController = require('../../controllers/UsuarioController');
const UsuarioService = require('../../services/UsuarioService');

jest.mock('../../services/UsuarioService');

describe('UsuarioController - Testes Unitários', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // ==========================================
    // LOGIN
    // ==========================================
    describe('login', () => {
        it('Deve retornar 200 e o payload de login com sucesso', async () => {
            const mockRespostaLogin = { token: 'jwt123', usuario: { nome: 'Admin' } };
            req.body = { email: 'admin@loja.com', senha: '123' };

            UsuarioService.login.mockResolvedValue(mockRespostaLogin);

            await UsuarioController.login(req, res);

            expect(UsuarioService.login).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockRespostaLogin);
        });

        it('Deve retornar 401 se houver erro de autenticação (senha incorreta)', async () => {
            UsuarioService.login.mockRejectedValue(new Error('Email ou senha incorretos.'));

            await UsuarioController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ erro: 'Email ou senha incorretos.' });
        });
    });

    // ==========================================
    // REGISTRAR
    // ==========================================
    describe('registrar', () => {
        it('Deve retornar 201 e criar o usuário com sucesso', async () => {
            const mockNovoUsuario = { id: 1, nome: 'Vendedor', role: 'vendedor' };
            req.body = { nome: 'Vendedor', email: 'venda@loja.com', senha: '123', role: 'vendedor' };

            UsuarioService.registrar.mockResolvedValue(mockNovoUsuario);

            await UsuarioController.registrar(req, res);

            expect(UsuarioService.registrar).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                mensagem: 'Usuário criado com sucesso!',
                usuario: mockNovoUsuario
            });
        });

        it('Deve retornar 400 se houver erro no cadastro (ex: email duplicado)', async () => {
            UsuarioService.registrar.mockRejectedValue(new Error('Este email já está cadastrado.'));

            await UsuarioController.registrar(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ erro: 'Este email já está cadastrado.' });
        });
    });
});