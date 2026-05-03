const errorHandler = (err, req, res, next) => {
    console.error(`[Erro Crítico] ${err.message}`);


    // Erro de Validação do Mongoose
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            tipo: 'Erro de Validação',
            mensagem: err.message
        });
    }

    // Erro de Autenticação
    if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            tipo: 'Erro de Autenticação',
            mensagem: 'Token inválido ou não fornecido. Faça login novamente.'
        });
    }

    // Erro de ID mal formatado do MongoDB
    if (err.name === 'CastError') {
        return res.status(400).json({
            tipo: 'Erro de Requisição',
            mensagem: 'Formato de ID inválido.'
        });
    }

    // Erro Genérico
    res.status(500).json({
        tipo: 'Erro Interno',
        mensagem: 'Ocorreu um erro inesperado no servidor.',
        detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

module.exports = errorHandler;