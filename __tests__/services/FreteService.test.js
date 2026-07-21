const axios = require('axios');
const FreteService = require('../../services/FreteService');

jest.mock('axios');

describe('FreteService - Testes Unitários', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Deve retornar os dados do frete quando a API da Superfrete responde com sucesso', async () => {
        const respostaMock = {
            data: [
                { name: 'PAC', price: 20.00 },
                { name: 'SEDEX', price: 45.00 }
            ]
        };
        axios.post.mockResolvedValue(respostaMock);

        const dadosPacoteMock = { from: { postal_code: "88495000" }, to: { postal_code: "01153000" } };

        const resultado = await FreteService.calcularFrete(dadosPacoteMock);

        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(resultado).toHaveLength(2);
        expect(resultado[0].name).toBe('PAC');
    });

    it('Deve lançar um erro formatado quando a API da Superfrete falha', async () => {
        const erroMock = {
            response: {
                status: 401,
                data: { message: 'Unauthorized' }
            }
        };
        axios.post.mockRejectedValue(erroMock);

        const dadosPacoteMock = { from: { postal_code: "88495000" }, to: { postal_code: "00000000" } };

        await expect(FreteService.calcularFrete(dadosPacoteMock)).rejects.toEqual({
            status: 401,
            data: { message: 'Unauthorized' }
        });

        expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('Deve chamar a API de cart ao gerar etiqueta', async () => {
        const respostaMock = { data: { id: '01JK6D99A7SVYXV03C3ZFS7CXA' } };
        axios.post.mockResolvedValue(respostaMock);

        const cartMock = { service: 1 };
        const resultado = await FreteService.gerarEtiqueta(cartMock);

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/api/v0/cart'),
            cartMock,
            expect.any(Object)
        );
        expect(resultado.id).toBe('01JK6D99A7SVYXV03C3ZFS7CXA');
    });

    it('Deve chamar a API de print ao buscar link da etiqueta', async () => {
        const respostaMock = { data: { url: 'https://sandbox.superfrete.com/print/01JK6D99A7.pdf' } };
        axios.post.mockResolvedValue(respostaMock);

        const printMock = { orders: ['01JK6D99A7SVYXV03C3ZFS7CXA'] };
        const resultado = await FreteService.imprimirEtiqueta(printMock);

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/api/v0/tag/print'),
            printMock,
            expect.any(Object)
        );
        expect(resultado.url).toContain('.pdf');
    });
});