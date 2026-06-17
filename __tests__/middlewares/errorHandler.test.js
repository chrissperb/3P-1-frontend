const errorHandler = require('../../middlewares/errorHandler');

describe('Error Handler Middleware - Testes Unitários', () => {

    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it('Deve formatar e retornar erro de Validação do Mongoose (400)', () => {
        const erro = new Error('Campo nome é obrigatório');
        erro.name = 'ValidationError';

        errorHandler(erro, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            tipo: 'Erro de Validação',
            mensagem: 'Campo nome é obrigatório'
        });
    });

    it('Deve formatar e retornar erro de Autenticação (UnauthorizedError) (401)', () => {
        const erro = new Error('Token faltando');
        erro.name = 'UnauthorizedError';

        errorHandler(erro, req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('Deve formatar e retornar erro de Autenticação (JsonWebTokenError) (401)', () => {
        const erro = new Error('Assinatura inválida');
        erro.name = 'JsonWebTokenError';

        errorHandler(erro, req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('Deve formatar e retornar erro de ID mal formatado do MongoDB (CastError) (400)', () => {
        const erro = new Error('Hexadecimal inválido');
        erro.name = 'CastError';

        errorHandler(erro, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            tipo: 'Erro de Requisição',
            mensagem: 'Formato de ID inválido.'
        });
    });

    it('Deve retornar Erro Genérico 500 SEM os detalhes em ambiente de produção', () => {
        process.env.NODE_ENV = 'production';
        const erro = new Error('Banco de dados explodiu');

        errorHandler(erro, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            tipo: 'Erro Interno',
            mensagem: 'Ocorreu um erro inesperado no servidor.',
            detalhes: undefined
        });
    });

    it('Deve retornar Erro Genérico 500 COM os detalhes em ambiente de desenvolvimento', () => {
        process.env.NODE_ENV = 'development';
        const erro = new Error('Banco de dados explodiu');

        errorHandler(erro, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            tipo: 'Erro Interno',
            mensagem: 'Ocorreu um erro inesperado no servidor.',
            detalhes: 'Banco de dados explodiu'
        });
    });
});