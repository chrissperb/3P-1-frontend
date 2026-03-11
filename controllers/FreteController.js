const axios = require('axios');

class FreteController {
    
    static async calcular(req, res) {
        try {
            const resposta = await axios.post(
                'https://api.superfrete.com/api/v0/calculator', 
                req.body,
                {
                    headers: {
                    accept: 'application/json',
                    'User-Agent': 'Cintia Smaniotto Sperb (cintiasmaniotto@icloud.com)',
                    'content-type': 'application/json',
                    Authorization: 'Bearer ${process.env.SUPER_FRETE_TOKEN}'
                    }
                }
            );

            res.status(200).json(resposta.data);

        } catch (error) {
            if (error.response) {
                console.error("❌ A SUPER FRETE RECUSOU OS DADOS. Motivo:", error.response.data);
                return res.status(error.response.status).json(error.response.data);
            }
            
            console.error("❌ ERRO INTERNO NO SERVIDOR:", error.message);
            res.status(500).json({ erro: 'Falha interna ao tentar calcular o frete.' });
        }
    }
}

module.exports = FreteController;


