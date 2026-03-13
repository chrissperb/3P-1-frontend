const FreteService = require('../services/FreteService');

class FreteController {
    
    static async calcular(req, res) {
        try {
            const dadosFrete = await FreteService.calcularFrete(req.body);
            
            res.status(200).json(dadosFrete);

        } catch (error) {
            if (error.status) {
                return res.status(error.status).json(error.data);
            }
            
            console.error("ERRO NO FRETE CONTROLLER:", error.message);
            res.status(500).json({ erro: error.message });
        }
    }
}

module.exports = FreteController;