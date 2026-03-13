const axios = require('axios');

class FreteService {
    
    static async calcularFrete(dadosPacote) {
        try {
            const resposta = await axios.post(
                'https://sandbox.superfrete.com/api/v0/calculator', 
                dadosPacote, 
                {
                    headers: {
                        'accept': 'application/json',
                        'User-Agent': 'BorbolelaPDV/1.0 (seu_email@dominio.com)',
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
}

module.exports = FreteService;