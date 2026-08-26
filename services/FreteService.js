const axios = require('axios');

const getBaseUrl = () => process.env.SUPER_FRETE_URL || 'https://api.superfrete.com';

class FreteService {

    static async calcularFrete(dadosPacote) {
        try {
            const baseUrl = getBaseUrl();
            const resposta = await axios.post(
                `${baseUrl}/api/v0/calculator`,
                dadosPacote,
                {
                    headers: {
                        'accept': 'application/json',
                        'User-Agent': 'BorbolelaPDV/1.0 (suporte@borbolelala.com.br)',
                        'content-type': 'application/json',
                        'Authorization': `Bearer ${process.env.SUPER_FRETE_TOKEN}`
                    }
                }
            );

            return resposta.data;

        } catch (error) {
            if (error.response) {
                throw { status: error.response.status, data: error.response.data };
            }
            throw new Error('Falha interna de comunicação com a Super Frete.');
        }
    }

    static async gerarEtiqueta(dadosCart) {
        try {
            const baseUrl = getBaseUrl();
            const resposta = await axios.post(
                `${baseUrl}/api/v0/cart`,
                dadosCart,
                {
                    headers: {
                        'accept': 'application/json',
                        'User-Agent': 'BorbolelaPDV/1.0 (suporte@borbolelala.com.br)',
                        'content-type': 'application/json',
                        'Authorization': `Bearer ${process.env.SUPER_FRETE_TOKEN}`
                    }
                }
            );

            return resposta.data;

        } catch (error) {
            if (error.response) {
                throw { status: error.response.status, data: error.response.data };
            }
            throw new Error('Falha interna de comunicação com a Super Frete ao gerar etiqueta.');
        }
    }

    static async imprimirEtiqueta(dadosPrint) {
        try {
            const baseUrl = getBaseUrl();
            const resposta = await axios.post(
                `${baseUrl}/api/v0/tag/print`,
                dadosPrint,
                {
                    headers: {
                        'accept': 'application/json',
                        'User-Agent': 'BorbolelaPDV/1.0 (suporte@borbolelala.com.br)',
                        'content-type': 'application/json',
                        'Authorization': `Bearer ${process.env.SUPER_FRETE_TOKEN}`
                    }
                }
            );

            return resposta.data;

        } catch (error) {
            if (error.response) {
                throw { status: error.response.status, data: error.response.data };
            }
            throw new Error('Falha interna de comunicação com a Super Frete ao buscar impressão.');
        }
    }
}

module.exports = FreteService;