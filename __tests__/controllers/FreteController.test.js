const FreteController = require('../../controllers/FreteController');
const FreteService = require('../../services/FreteService');

jest.mock('../../services/FreteService');

describe('FreteController - Testes Unitários', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();

        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    // ==========================================
    // CALCULAR FRETE
    // ==========================================
    describe('calcular', () => {
        it('Deve retornar 200 e os dados do frete calculados', async () => {
            req.body = { cepDestino: '01001000' };
            const mockFrete = [{ name: 'PAC', price: 20.00 }];

            FreteService.calcularFrete.mockResolvedValue(mockFrete);

            await FreteController.calcular(req, res);

            expect(FreteService.calcularFrete).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockFrete);
        });

        it('Deve repassar o status exato e a resposta se o erro vier formatado da Superfrete', async () => {
            const erroFormatado = new Error();
            erroFormatado.status = 401;
            erroFormatado.data = { message: 'Unauthorized' };

            FreteService.calcularFrete.mockRejectedValue(erroFormatado);

            await FreteController.calcular(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
            expect(console.error).not.toHaveBeenCalled();
        });

        it('Deve retornar 500 e logar no console se ocorrer um erro genérico', async () => {
            const erroGenerico = new Error('Falha de rede');
            FreteService.calcularFrete.mockRejectedValue(erroGenerico);

            await FreteController.calcular(req, res);

            expect(console.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ erro: 'Falha de rede' });
        });
    });

    describe('gerarEtiqueta', () => {
        it('Deve retornar 200 e o id da etiqueta gerada', async () => {
            req.body = { service: 1 };
            const mockResposta = { id: '01JK6D99A7SVYXV03C3ZFS7CXA' };
            FreteService.gerarEtiqueta.mockResolvedValue(mockResposta);

            await FreteController.gerarEtiqueta(req, res);

            expect(FreteService.gerarEtiqueta).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResposta);
        });
    });

    describe('imprimirEtiqueta', () => {
        it('Deve retornar 200 e a URL do PDF da etiqueta', async () => {
            req.body = { orders: ['01JK6D99A7SVYXV03C3ZFS7CXA'] };
            const mockResposta = { url: 'https://sandbox.superfrete.com/print/01JK6D99A7.pdf' };
            FreteService.imprimirEtiqueta.mockResolvedValue(mockResposta);

            await FreteController.imprimirEtiqueta(req, res);

            expect(FreteService.imprimirEtiqueta).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResposta);
        });
    });
});