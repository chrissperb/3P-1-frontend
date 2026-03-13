const jwt = require('jsonwebtoken');

// 1. Verifica Token válido
const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ erro: 'Acesso negado. Crachá (Token) não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        req.usuario = decodificado;
        
        next();
    } catch (error) {
        return res.status(401).json({ erro: 'Token inválido ou expirado. Faça login novamente.' });
    }
};

// 2. Verifica se a pessoa é admin
const apenasAdmin = (req, res, next) => {
    if (req.usuario.role !== 'admin') {
        return res.status(403).json({ erro: 'Acesso bloqueado. Apenas gerentes (admin) podem fazer isso.' });
    }
    next(); 
};

module.exports = { verificarToken, apenasAdmin };