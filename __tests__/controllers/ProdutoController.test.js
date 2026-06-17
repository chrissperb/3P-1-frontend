const ProdutoController = require('../../controllers/ProdutoController');
const ProdutoService = require('../../services/ProdutoService');

jest.mock('../../services/ProdutoService');

describe('ProdutoController - Testes Unitários', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // ==========================================
    // CRIAR PRODUTO
    // ==========================================
    describe('criarProduto', () => {
        it('Deve retornar 201 e criar o produto com sucesso', async () => {
            req.body = { id: 1, nome: 'Camiseta' };
            ProdutoService.criar.mockResolvedValue({ id: 1, nome: 'Camiseta' });

            await ProdutoController.criarProduto(req, res);

            expect(ProdutoService.criar).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                mensagem: 'Produto cadastrado com sucesso!',
                produto: { id: 1, nome: 'Camiseta' }
            });
        });

        it('Deve retornar 400 se o erro for de ID duplicado', async () => {
            ProdutoService.criar.mockRejectedValue(new Error('ID numérico já existe'));

            await ProdutoController.criarProduto(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ erro: 'ID numérico já existe' });
        });

        it('Deve retornar 500 para outros erros', async () => {
            ProdutoService.criar.mockRejectedValue(new Error('Erro genérico no banco'));

            await ProdutoController.criarProduto(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ erro: 'Erro genérico no banco' });
        });
    });

    // ==========================================
    // LISTAR PRODUTOS
    // ==========================================
    describe('listarProdutos', () => {
        it('Deve retornar 200 e a lista de produtos', async () => {
            const mockLista = [{ nome: 'Produto A' }, { nome: 'Produto B' }];
            ProdutoService.listarTodos.mockResolvedValue(mockLista);

            await ProdutoController.listarProdutos(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockLista);
        });

        it('Deve retornar 500 se o service falhar', async () => {
            ProdutoService.listarTodos.mockRejectedValue(new Error('Falha'));

            await ProdutoController.listarProdutos(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ erro: 'Falha ao buscar o catálogo.' });
        });
    });

    // ==========================================
    // BUSCAR POR ID
    // ==========================================
    describe('buscarPorId', () => {
        it('Deve retornar 200 e o produto encontrado', async () => {
            req.params.id = '10';
            ProdutoService.buscarPorId.mockResolvedValue({ id: 10, nome: 'Produto C' });

            await ProdutoController.buscarPorId(req, res);

            expect(ProdutoService.buscarPorId).toHaveBeenCalledWith(10);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('Deve retornar 404 se o produto não existir', async () => {
            req.params.id = '99';
            ProdutoService.buscarPorId.mockRejectedValue(new Error('Não encontrado'));

            await ProdutoController.buscarPorId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ erro: 'Não encontrado' });
        });
    });

    // ==========================================
    // ATUALIZAR PRODUTO
    // ==========================================
    describe('atualizarProduto', () => {
        it('Deve retornar 200 ao atualizar com sucesso', async () => {
            req.params.id = '1';
            req.body = { precoVenda: 50 };
            ProdutoService.atualizar.mockResolvedValue({ id: 1, precoVenda: 50 });

            await ProdutoController.atualizarProduto(req, res);

            expect(ProdutoService.atualizar).toHaveBeenCalledWith(1, req.body);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('Deve retornar 404 se falhar na atualização', async () => {
            req.params.id = '99';
            ProdutoService.atualizar.mockRejectedValue(new Error('Falha na atualização'));

            await ProdutoController.atualizarProduto(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // ==========================================
    // DELETAR PRODUTO
    // ==========================================
    describe('deletarProduto', () => {
        it('Deve retornar 200 ao deletar com sucesso', async () => {
            req.params.id = '1';
            ProdutoService.deletar.mockResolvedValue(true);

            await ProdutoController.deletarProduto(req, res);

            expect(ProdutoService.deletar).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('Deve retornar 404 se falhar ao deletar', async () => {
            req.params.id = '99';
            ProdutoService.deletar.mockRejectedValue(new Error('Não encontrado para exclusão'));

            await ProdutoController.deletarProduto(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});