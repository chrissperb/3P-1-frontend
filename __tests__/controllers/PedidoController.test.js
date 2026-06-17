const PedidoController = require('../../controllers/PedidoController');
const PedidoService = require('../../services/PedidoService');

jest.mock('../../services/PedidoService');

describe('PedidoController - Testes Unitários', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();

        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    // ==========================================
    // CRIAR PEDIDO
    // ==========================================
    describe('criarPedido', () => {
        it('Deve retornar 201 e criar o pedido com sucesso', async () => {
            req.body = { cliente: 'Christian', itens: [] };
            PedidoService.processarCheckout.mockResolvedValue({ id: 'ped123', status: 'Pago' });

            await PedidoController.criarPedido(req, res);

            expect(PedidoService.processarCheckout).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                mensagem: 'Venda finalizada com sucesso!',
                pedido: { id: 'ped123', status: 'Pago' }
            });
        });

        it('Deve retornar 400 se o checkout falhar (ex: sem estoque)', async () => {
            PedidoService.processarCheckout.mockRejectedValue(new Error('Estoque insuficiente'));

            await PedidoController.criarPedido(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ erro: 'Estoque insuficiente' });
        });
    });

    // ==========================================
    // LISTAR PEDIDOS
    // ==========================================
    describe('listarPedidos', () => {
        it('Deve retornar 200 e a lista de pedidos', async () => {
            const mockLista = [{ id: 'ped1' }, { id: 'ped2' }];
            PedidoService.listarTodos.mockResolvedValue(mockLista);

            await PedidoController.listarPedidos(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockLista);
        });

        it('Deve retornar 500 e registrar o erro no console se a listagem falhar', async () => {
            PedidoService.listarTodos.mockRejectedValue(new Error('Falha no BD'));

            await PedidoController.listarPedidos(req, res);

            expect(console.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ erro: 'Falha ao buscar o histórico de vendas.' });
        });
    });

    // ==========================================
    // ATUALIZAR STATUS
    // ==========================================
    describe('atualizarStatus', () => {
        it('Deve retornar 200 ao atualizar o status com sucesso', async () => {
            req.params.id = 'ped1';
            req.body.status = 'Enviado';
            PedidoService.atualizarStatus.mockResolvedValue({ id: 'ped1', status: 'Enviado' });

            await PedidoController.atualizarStatus(req, res);

            expect(PedidoService.atualizarStatus).toHaveBeenCalledWith('ped1', 'Enviado');
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('Deve retornar 404 se o pedido não for encontrado para atualização', async () => {
            req.params.id = 'ped99';
            PedidoService.atualizarStatus.mockRejectedValue(new Error('Pedido não encontrado.'));

            await PedidoController.atualizarStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ erro: 'Pedido não encontrado.' });
        });
    });

    // ==========================================
    // DELETAR PEDIDO
    // ==========================================
    describe('deletarPedido', () => {
        it('Deve retornar 200 ao deletar com sucesso', async () => {
            req.params.id = 'ped1';
            PedidoService.deletarPedido.mockResolvedValue({ mensagem: 'Excluído com sucesso' });

            await PedidoController.deletarPedido(req, res);

            expect(PedidoService.deletarPedido).toHaveBeenCalledWith('ped1');
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('Deve retornar 404 se não achar o pedido para deletar', async () => {
            req.params.id = 'ped99';
            PedidoService.deletarPedido.mockRejectedValue(new Error('Não encontrado para exclusão.'));

            await PedidoController.deletarPedido(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});