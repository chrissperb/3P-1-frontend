const Pedido = require('../../models/pedido/Pedido');
const Produto = require('../../models/produto/Produto');
const PedidoService = require('../../services/PedidoService');

jest.mock('../../models/pedido/Pedido');
jest.mock('../../models/produto/Produto');

describe('PedidoService - Testes Unitários', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // TESTES DO MÉTODO: processarCheckout
    // ==========================================
    describe('processarCheckout', () => {
        const payloadCheckout = {
            cliente: 'João',
            endereco: { logradouro: 'Rua A' },
            itens: [{ produtoId: 1, quantidade: 2 }]
        };

        it('Deve processar o checkout com sucesso, baixando o estoque e criando o pedido', async () => {
            const saveProdutoMock = jest.fn().mockResolvedValue();

            Produto.findOne.mockResolvedValue({
                id: 1,
                nome: 'Camiseta',
                quantidade: 10,
                precoVenda: 50.0,
                save: saveProdutoMock
            });

            const savePedidoMock = jest.fn().mockResolvedValue({ status: 'Pago', totalFinal: 100.0 });
            Pedido.mockImplementation(() => ({
                save: savePedidoMock
            }));

            const resultado = await PedidoService.processarCheckout(payloadCheckout);

            expect(Produto.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(saveProdutoMock).toHaveBeenCalledTimes(1);
            expect(savePedidoMock).toHaveBeenCalledTimes(1);
            expect(resultado.status).toBe('Pago');
        });

        it('Deve lançar erro se o produto do carrinho não existir no banco', async () => {
            Produto.findOne.mockResolvedValue(null);

            await expect(PedidoService.processarCheckout(payloadCheckout))
                .rejects.toThrow('Produto ID 1 não existe.');
        });

        it('Deve lançar erro se não houver estoque suficiente', async () => {
            Produto.findOne.mockResolvedValue({
                id: 1,
                nome: 'Camiseta',
                quantidade: 1
            });

            await expect(PedidoService.processarCheckout(payloadCheckout))
                .rejects.toThrow('Estoque insuficiente para: Camiseta. Temos apenas 1 unidades.');
        });
    });

    // ==========================================
    // TESTES DO MÉTODO: listarTodos
    // ==========================================
    describe('listarTodos', () => {
        it('Deve listar todos os pedidos ordenados por data', async () => {
            const mockPedidos = [{ _id: 'ped1', cliente: 'Maria' }];
            Pedido.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockPedidos)
            });

            const resultado = await PedidoService.listarTodos();

            expect(Pedido.find).toHaveBeenCalledTimes(1);
            expect(resultado).toHaveLength(1);
            expect(resultado[0].cliente).toBe('Maria');
        });
    });

    // ==========================================
    // TESTES DO MÉTODO: atualizarStatus
    // ==========================================
    describe('atualizarStatus', () => {
        it('Deve atualizar o status de um pedido com sucesso', async () => {
            Pedido.findByIdAndUpdate.mockResolvedValue({ _id: 'ped1', status: 'Enviado' });

            const resultado = await PedidoService.atualizarStatus('ped1', 'Enviado');

            expect(Pedido.findByIdAndUpdate).toHaveBeenCalledWith(
                'ped1',
                { status: 'Enviado' },
                { returnDocument: 'after' }
            );
            expect(resultado.status).toBe('Enviado');
        });

        it('Deve lançar erro ao tentar atualizar um pedido inexistente', async () => {
            Pedido.findByIdAndUpdate.mockResolvedValue(null);

            await expect(PedidoService.atualizarStatus('ped99', 'Enviado'))
                .rejects.toThrow('Pedido não encontrado.');
        });
    });

    // ==========================================
    // TESTES DO MÉTODO: deletarPedido
    // ==========================================
    describe('deletarPedido', () => {
        it('Deve deletar o pedido e restaurar o estoque dos produtos', async () => {
            Pedido.findById.mockResolvedValue({
                _id: 'ped1',
                itens: [{ produtoId: 1, quantidade: 2 }]
            });

            const saveProdutoMock = jest.fn().mockResolvedValue();
            Produto.findOne.mockResolvedValue({
                id: 1,
                quantidade: 5,
                save: saveProdutoMock
            });

            Pedido.findByIdAndDelete.mockResolvedValue(true);

            const resultado = await PedidoService.deletarPedido('ped1');

            expect(Pedido.findById).toHaveBeenCalledWith('ped1');
            expect(Produto.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(saveProdutoMock).toHaveBeenCalledTimes(1);
            expect(Pedido.findByIdAndDelete).toHaveBeenCalledWith('ped1');
            expect(resultado.mensagem).toBe('Pedido excluído com sucesso e estoque restaurado!');
        });

        it('Deve lançar erro ao tentar deletar um pedido inexistente', async () => {
            Pedido.findById.mockResolvedValue(null);

            await expect(PedidoService.deletarPedido('ped99'))
                .rejects.toThrow('Pedido não encontrado para exclusão.');
        });
    });
});