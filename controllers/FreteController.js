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
            console.error("ERRO NO FRETE CONTROLLER (calcular):", error.message);
            res.status(500).json({ erro: error.message });
        }
    }

    static async gerarEtiqueta(req, res) {
        try {
            const dadosEtiqueta = await FreteService.gerarEtiqueta(req.body);
            res.status(200).json(dadosEtiqueta);
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json(error.data);
            }
            console.error("ERRO NO FRETE CONTROLLER (gerarEtiqueta):", error.message);
            res.status(500).json({ erro: error.message });
        }
    }

    static async imprimirEtiqueta(req, res) {
        try {
            const dadosImpressao = await FreteService.imprimirEtiqueta(req.body);
            res.status(200).json(dadosImpressao);
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json(error.data);
            }
            console.error("ERRO NO FRETE CONTROLLER (imprimirEtiqueta):", error.message);
            res.status(500).json({ erro: error.message });
        }
    }
}

module.exports = FreteController;