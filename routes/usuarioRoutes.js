const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

/**
*@swagger
* /api/login:
*   post:
*     summary: Realiza o login no sistema
*     tags: [Autenticação]
*     description: Recebe email e senha, valida no banco e retorna um Token JWT.
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               email:
*                 type: string
*                 example: admin@borbolelala.com
*               senha:
*                 type: string
*                 example: senhaSegura123
*     responses:
*       200:
*         description: Login realizado com sucesso. Retorna o Token.
*       401:
*         description: E-mail ou senha incorretos.
*/
router.post('/login', UsuarioController.login);
router.post('/usuarios', UsuarioController.registrar);

module.exports = router;