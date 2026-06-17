const request = require('supertest');
const app = require('../server');

describe('Testes de Infraestrutura (Health Check)', () => {

    it('Deve retornar status online e a mensagem de boas-vindas na rota raiz (/)', async () => {

        const resposta = await request(app).get('/');

        expect(resposta.status).toBe(200);
        expect(resposta.body).toHaveProperty('status', 'online');
        expect(resposta.body.mensagem).toContain('Borbolêlalá');
    });

});