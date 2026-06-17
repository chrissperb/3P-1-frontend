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
});