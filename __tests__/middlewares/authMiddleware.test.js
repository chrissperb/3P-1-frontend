const jwt = require('jsonwebtoken');
const { verificarToken, apenasAdmin } = require('../../middlewares/authMiddleware');

jest.mock('jsonwebtoken');

describe('Auth Middleware - Testes Unitários', () => {

    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();
        process.env.JWT_SECRET = 'segredo-teste';
        jest.clearAllMocks();
    });

    // ==========================================
    // TESTES: verificarToken
    // ==========================================
    describe('verificarToken', () => {
        it('Deve barrar acesso se não houver cabeçalho de autorização', () => {
            verificarToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ erro: 'Acesso negado. Crachá (Token) não fornecido.' });
            expect(next).not.toHaveBeenCalled();
        });

        it('Deve barrar acesso se o token não começar com "Bearer "', () => {
            req.headers.authorization = 'TokenInvalido 123456';

            verificarToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        it('Deve liberar acesso e salvar o usuário na requisição se o token for válido', () => {
            req.headers.authorization = 'Bearer token-jwt-valido';
            const usuarioDecodificado = { id: 1, role: 'admin' };

            jwt.verify.mockReturnValue(usuarioDecodificado);

            verificarToken(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith('token-jwt-valido', 'segredo-teste');
            expect(req.usuario).toEqual(usuarioDecodificado);
            expect(next).toHaveBeenCalledTimes(1);
        });

        it('Deve barrar acesso se o token for inválido ou expirado', () => {
            req.headers.authorization = 'Bearer token-vencido';

            jwt.verify.mockImplementation(() => { throw new Error('Expirado') });

            verificarToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ erro: 'Token inválido ou expirado. Faça login novamente.' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // TESTES: apenasAdmin
    // ==========================================
    describe('apenasAdmin', () => {
        it('Deve liberar acesso se o usuário for admin', () => {
            req.usuario = { role: 'admin' };

            apenasAdmin(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });

        it('Deve barrar acesso se o usuário não for admin (ex: caixa, cliente)', () => {
            req.usuario = { role: 'vendedor' };

            apenasAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ erro: 'Acesso bloqueado. Apenas gerentes (admin) podem fazer isso.' });
            expect(next).not.toHaveBeenCalled();
        });
    });
});