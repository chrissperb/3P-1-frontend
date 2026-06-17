const Produto = require('../../models/produto/Produto');
const ProdutoService = require('../../services/ProdutoService');

jest.mock('../../models/produto/Produto');

describe('ProdutoService - Testes Unitários', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // TESTES DO MÉTODO: listarTodos
    // ==========================================
    it('Deve listar todos os produtos', async () => {
        const mockProdutos = [{ id: 1, nome: 'Vestido' }];
        Produto.find.mockResolvedValue(mockProdutos);

        const resultado = await ProdutoService.listarTodos();

        expect(Produto.find).toHaveBeenCalledTimes(1);
        expect(resultado).toHaveLength(1);
    });

    // ==========================================
    // TESTES DO MÉTODO: criar
    // ==========================================
    it('Deve criar um novo produto com sucesso', async () => {
        const dadosEntrada = { id: 1, nome: 'Cueca' };

        const saveMock = jest.fn().mockResolvedValue(dadosEntrada);
        Produto.mockImplementation(() => ({
            save: saveMock
        }));

        const resultado = await ProdutoService.criar(dadosEntrada);

        expect(saveMock).toHaveBeenCalledTimes(1);
        expect(resultado.nome).toBe('Cueca');
    });

    it('Deve lançar erro 11000 se o ID numérico já existir ao criar', async () => {
        const erroDuplicado = new Error('Duplicado');
        erroDuplicado.code = 11000;

        const saveMock = jest.fn().mockRejectedValue(erroDuplicado);
        Produto.mockImplementation(() => ({
            save: saveMock
        }));

        await expect(ProdutoService.criar({})).rejects.toThrow('Já existe um produto com este ID numérico.');
    });

    it('Deve repassar erros genéricos ao falhar na criação', async () => {
        const erroGenerico = new Error('Erro genérico no BD');
        const saveMock = jest.fn().mockRejectedValue(erroGenerico);
        Produto.mockImplementation(() => ({
            save: saveMock
        }));

        await expect(ProdutoService.criar({})).rejects.toThrow('Erro genérico no BD');
    });

    // ==========================================
    // TESTES DO MÉTODO: buscarPorId
    // ==========================================
    it('Deve buscar um produto por ID com sucesso', async () => {
        Produto.findOne.mockResolvedValue({ id: 99, nome: 'Calcinha' });

        const resultado = await ProdutoService.buscarPorId(99);

        expect(Produto.findOne).toHaveBeenCalledWith({ id: 99 });
        expect(resultado.nome).toBe('Calcinha');
    });

    it('Deve lançar erro ao buscar um ID que não existe', async () => {
        Produto.findOne.mockResolvedValue(null);

        await expect(ProdutoService.buscarPorId(99)).rejects.toThrow('Produto não encontrado.');
    });

    // ==========================================
    // TESTES DO MÉTODO: atualizar
    // ==========================================
    it('Deve atualizar um produto com sucesso', async () => {
        const dadosAtualizacao = { precoVenda: 50.0 };
        Produto.findOneAndUpdate.mockResolvedValue({ id: 1, precoVenda: 50.0 });

        const resultado = await ProdutoService.atualizar(1, dadosAtualizacao);

        expect(Produto.findOneAndUpdate).toHaveBeenCalledWith(
            { id: 1 },
            dadosAtualizacao,
            { returnDocument: 'after', runValidators: true }
        );
        expect(resultado.precoVenda).toBe(50.0);
    });

    it('Deve lançar erro ao tentar atualizar um produto inexistente', async () => {
        Produto.findOneAndUpdate.mockResolvedValue(null);

        await expect(ProdutoService.atualizar(99, {})).rejects.toThrow('Produto não encontrado para atualização.');
    });

    // ==========================================
    // TESTES DO MÉTODO: deletar
    // ==========================================
    it('Deve deletar um produto com sucesso', async () => {
        Produto.findOneAndDelete.mockResolvedValue({ id: 1, nome: 'Conjunto' });

        const resultado = await ProdutoService.deletar(1);

        expect(Produto.findOneAndDelete).toHaveBeenCalledWith({ id: 1 });
        expect(resultado.nome).toBe('Conjunto');
    });

    it('Deve lançar erro ao tentar deletar um produto inexistente', async () => {
        Produto.findOneAndDelete.mockResolvedValue(null);

        await expect(ProdutoService.deletar(99)).rejects.toThrow('Produto não encontrado para exclusão.');
    });
});