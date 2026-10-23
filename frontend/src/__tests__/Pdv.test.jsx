import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Pdv from '../pages/Pdv';
import { vi } from 'vitest';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockedNavigate };
});

// Mock do Fetch Global
global.fetch = vi.fn();

import.meta.env.VITE_API_URL = 'http://localhost:3000';

describe('Componente PDV - Testes de Comportamento', () => {

    const mockProdutos = [
        { id: 1, nome: 'Vestido Floral', categoria: 'vestido', precoVenda: 100, quantidade: 10 },
        { id: 2, nome: 'Cueca Kids', categoria: 'cueca', precoVenda: 20, quantidade: 5 }
    ];

    const resposta = (dados, status = 200, ok = true) => ({
        status,
        ok,
        json: async () => dados
    });

    // Roteia o mock de fetch por URL, em vez de depender da ordem das chamadas.
    const criarRotas = (overrides = {}) => {
        const respostas = {
            produtos: resposta(mockProdutos),
            frete: resposta([{ id: 1, name: 'SEDEX', price: '25.00', delivery_time: '2' }]),
            etiqueta: resposta({ id: 'TAG-12345' }),
            impressao: resposta({ url: 'https://sandbox.superfrete.com/print/TAG-12345.pdf' }),
            pedido: resposta({ mensagem: 'Sucesso' }),
            viaCep: resposta({ erro: true }),
            ...overrides
        };

        return (url) => {
            const endereco = String(url);

            if (endereco.includes('viacep.com.br')) return Promise.resolve(respostas.viaCep);
            if (endereco.endsWith('/produtos')) return Promise.resolve(respostas.produtos);
            if (endereco.endsWith('/frete/etiqueta')) return Promise.resolve(respostas.etiqueta);
            if (endereco.endsWith('/frete/imprimir')) return Promise.resolve(respostas.impressao);
            if (endereco.endsWith('/frete')) return Promise.resolve(respostas.frete);
            if (endereco.endsWith('/pedidos')) return Promise.resolve(respostas.pedido);

            return Promise.resolve(resposta({}));
        };
    };

    const preencherDestinatario = (dados = {}) => {
        const valores = {
            nome: 'Maria da Silva',
            documento: '12345678901',
            email: 'maria@email.com',
            cep: '80000000',
            logradouro: 'Rua das Flores',
            numero: '123',
            complemento: 'Apto 4',
            bairro: 'Jardim América',
            cidade: 'Curitiba',
            uf: 'PR',
            ...dados
        };

        fireEvent.change(screen.getByLabelText(/Nome do destinatário/i), { target: { value: valores.nome } });
        fireEvent.change(screen.getByLabelText(/CPF\/CNPJ/i), { target: { value: valores.documento } });
        fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: valores.email } });
        fireEvent.change(screen.getByLabelText(/CEP Destino/i), { target: { value: valores.cep } });
        fireEvent.change(screen.getByLabelText(/^Logradouro$/i), { target: { value: valores.logradouro } });
        fireEvent.change(screen.getByLabelText(/^Número$/i), { target: { value: valores.numero } });
        fireEvent.change(screen.getByLabelText(/^Complemento$/i), { target: { value: valores.complemento } });
        fireEvent.change(screen.getByLabelText(/^Bairro$/i), { target: { value: valores.bairro } });
        fireEvent.change(screen.getByLabelText(/^Cidade$/i), { target: { value: valores.cidade } });
        fireEvent.change(screen.getByLabelText(/^UF$/i), { target: { value: valores.uf } });

        return valores;
    };

    const buscarFrete = () => {
        fireEvent.click(screen.getByText(/Buscar Frete/i));
    };

    const adicionarPrimeiroProduto = async () => {
        const botoesAdicionar = await screen.findAllByText('+ Adicionar');
        fireEvent.click(botoesAdicionar[0]);
    };

    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.setItem('token', 'token-valido');
        fetch.mockImplementation(criarRotas());
    });

    it('Deve carregar e exibir os produtos do catálogo', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        expect(screen.getByText(/A carregar catálogo/i)).toBeInTheDocument();

        const produtoNome = await screen.findByText('Vestido Floral');
        expect(produtoNome).toBeInTheDocument();
    });

    it('Deve adicionar um produto ao carrinho ao clicar no botão', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await adicionarPrimeiroProduto();

        const itemNoCarrinho = await screen.findByText(/1x R\$ 100\.00/i);
        expect(itemNoCarrinho).toBeInTheDocument();
    });

    it('Deve simular o cálculo de frete quando um CEP é inserido', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        await adicionarPrimeiroProduto();

        const inputCepOrigem = screen.getByPlaceholderText(/CEP Origem/i);
        expect(inputCepOrigem.value).toBe('88495000');

        const inputCep = screen.getByPlaceholderText(/CEP do Destino/i);
        fireEvent.change(inputCep, { target: { value: '88495000' } });

        buscarFrete();

        const opcaoFrete = await screen.findByText(/SEDEX - R\$ 25.00/i);
        expect(opcaoFrete).toBeInTheDocument();
    });

    it('Deve permitir editar o CEP de origem para o cálculo do frete', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        await adicionarPrimeiroProduto();

        const inputCepOrigem = screen.getByPlaceholderText(/CEP Origem/i);
        fireEvent.change(inputCepOrigem, { target: { value: '01001000' } });
        expect(inputCepOrigem.value).toBe('01001000');

        const inputCepDestino = screen.getByPlaceholderText(/CEP do Destino/i);
        fireEvent.change(inputCepDestino, { target: { value: '88495000' } });

        buscarFrete();

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/frete',
                expect.objectContaining({
                    body: expect.stringContaining('"postal_code":"01001000"')
                })
            );
        });
    });

    it('Deve preencher o endereço do destinatário automaticamente ao sair do campo CEP', async () => {
        fetch.mockImplementation(criarRotas({
            viaCep: resposta({
                logradouro: 'Rua Manoel Domingos Ferreira',
                bairro: 'Campo Duna',
                localidade: 'Garopaba',
                uf: 'SC'
            })
        }));

        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');
        await adicionarPrimeiroProduto();

        const inputCepDestino = screen.getByPlaceholderText(/CEP do Destino/i);
        fireEvent.change(inputCepDestino, { target: { value: '88495000' } });
        fireEvent.blur(inputCepDestino);

        await waitFor(() => {
            expect(screen.getByLabelText(/^Logradouro$/i).value).toBe('Rua Manoel Domingos Ferreira');
        });
        expect(screen.getByLabelText(/^Bairro$/i).value).toBe('Campo Duna');
        expect(screen.getByLabelText(/^Cidade$/i).value).toBe('Garopaba');
        expect(screen.getByLabelText(/^UF$/i).value).toBe('SC');
        expect(fetch).toHaveBeenCalledWith('https://viacep.com.br/ws/88495000/json/');
    });

    it('Deve alertar e manter o endereço editável quando o CEP não for encontrado', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');
        await adicionarPrimeiroProduto();

        const inputCepDestino = screen.getByPlaceholderText(/CEP do Destino/i);
        fireEvent.change(inputCepDestino, { target: { value: '99999999' } });
        fireEvent.blur(inputCepDestino);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('CEP não encontrado'));
        });

        fireEvent.change(screen.getByLabelText(/^Cidade$/i), { target: { value: 'Curitiba' } });
        expect(screen.getByLabelText(/^Cidade$/i).value).toBe('Curitiba');
    });

    it('Deve calcular o frete sem seguro por padrão', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');
        await adicionarPrimeiroProduto();

        expect(screen.queryByLabelText(/^Valor declarado/i)).not.toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/CEP do Destino/i), { target: { value: '80000000' } });
        buscarFrete();

        await screen.findByText(/SEDEX - R\$ 25.00/i);

        const chamadaFrete = fetch.mock.calls.find(([url]) => String(url).endsWith('/frete'));
        expect(JSON.parse(chamadaFrete[1].body).options).toEqual({
            own_hand: false,
            receipt: false,
            insurance_value: 0,
            use_insurance_value: false
        });
    });

    it('Deve exibir o campo de valor declarado ao ligar o seguro e enviá-lo no cálculo', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');
        await adicionarPrimeiroProduto();

        expect(screen.queryByLabelText(/^Valor declarado/i)).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('switch', { name: /Adicionar seguro/i }));

        const campoValor = await screen.findByLabelText(/^Valor declarado/i);
        fireEvent.change(campoValor, { target: { value: '250.50' } });

        fireEvent.change(screen.getByPlaceholderText(/CEP do Destino/i), { target: { value: '80000000' } });
        buscarFrete();

        await screen.findByText(/SEDEX - R\$ 25.00/i);

        const chamadaFrete = fetch.mock.calls.find(([url]) => String(url).endsWith('/frete'));
        const options = JSON.parse(chamadaFrete[1].body).options;

        expect(options.insurance_value).toBe(250.5);
        expect(options.use_insurance_value).toBe(true);
    });

    it('Não deve calcular o frete com seguro ligado e valor declarado inválido', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');
        await adicionarPrimeiroProduto();

        fireEvent.click(screen.getByRole('switch', { name: /Adicionar seguro/i }));
        fireEvent.change(screen.getByPlaceholderText(/CEP do Destino/i), { target: { value: '80000000' } });

        buscarFrete();

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('valor declarado'));
        });

        expect(fetch.mock.calls.some(([url]) => String(url).endsWith('/frete'))).toBe(false);
    });

    it('Deve limpar as opções de frete quando o valor declarado for alterado após a busca', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');
        await adicionarPrimeiroProduto();

        fireEvent.click(screen.getByRole('switch', { name: /Adicionar seguro/i }));
        fireEvent.change(screen.getByLabelText(/^Valor declarado/i), { target: { value: '250.50' } });
        fireEvent.change(screen.getByPlaceholderText(/CEP do Destino/i), { target: { value: '80000000' } });

        buscarFrete();

        await screen.findByText(/SEDEX - R\$ 25.00/i);

        fireEvent.change(screen.getByLabelText(/^Valor declarado/i), { target: { value: '300' } });

        expect(screen.queryByText(/SEDEX - R\$ 25.00/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Gerar etiqueta/i)).not.toBeInTheDocument();
    });

    it('Deve enviar o valor declarado também no payload da etiqueta', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');
        await adicionarPrimeiroProduto();

        preencherDestinatario();

        fireEvent.click(screen.getByRole('switch', { name: /Adicionar seguro/i }));
        fireEvent.change(screen.getByLabelText(/^Valor declarado/i), { target: { value: '250.50' } });

        buscarFrete();

        await screen.findByText(/SEDEX - R\$ 25.00/i);
        fireEvent.click(screen.getByText(/Gerar etiqueta/i));

        await waitFor(() => {
            expect(fetch.mock.calls.some(([url]) => String(url).endsWith('/frete/etiqueta'))).toBe(true);
        });

        const chamadaEtiqueta = fetch.mock.calls.find(([url]) => String(url).endsWith('/frete/etiqueta'));
        const options = JSON.parse(chamadaEtiqueta[1].body).options;

        expect(options).toEqual({
            tags: [],
            non_commercial: true,
            insurance_value: 250.5,
            use_insurance_value: true
        });
    });

    it('Deve enviar a declaração de conteúdo com o valor declarado', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        await adicionarPrimeiroProduto();

        preencherDestinatario();

        fireEvent.click(screen.getByRole('switch', { name: /Adicionar seguro/i }));
        fireEvent.change(screen.getByLabelText(/^Valor declarado/i), { target: { value: '250.50' } });

        buscarFrete();

        await screen.findByText(/SEDEX - R\$ 25.00/i);
        fireEvent.click(screen.getByText(/Gerar etiqueta/i));

        await waitFor(() => {
            expect(fetch.mock.calls.some(([url]) => String(url).endsWith('/frete/etiqueta'))).toBe(true);
        });

        const chamadaEtiqueta = fetch.mock.calls.find(([url]) => String(url).endsWith('/frete/etiqueta'));
        const corpoEtiqueta = JSON.parse(chamadaEtiqueta[1].body);

        expect(corpoEtiqueta.products).toEqual([
            { name: 'Vestuário', quantity: 1, unitary_value: 250.5 }
        ]);

        const corpoSerializado = JSON.stringify(corpoEtiqueta);
        expect(corpoSerializado).not.toContain('26.4');
    });

    it('Deve executar o fluxo completo de gerar e imprimir etiqueta com os dados do destinatário', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        await adicionarPrimeiroProduto();

        const destinatario = preencherDestinatario();

        buscarFrete();

        const opcaoFrete = await screen.findByText(/SEDEX - R\$ 25.00/i);
        expect(opcaoFrete).toBeInTheDocument();

        const botaoGerarEtiqueta = screen.getByText(/Gerar etiqueta/i);
        fireEvent.click(botaoGerarEtiqueta);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/frete/imprimir',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ orders: ['TAG-12345'] })
                })
            );
        });

        const chamadaEtiqueta = fetch.mock.calls.find(([url]) => String(url).endsWith('/frete/etiqueta'));
        expect(chamadaEtiqueta).toBeDefined();

        const corpoEtiqueta = JSON.parse(chamadaEtiqueta[1].body);
        expect(corpoEtiqueta.to).toEqual({
            name: destinatario.nome,
            address: destinatario.logradouro,
            city: destinatario.cidade,
            state_abbr: destinatario.uf,
            postal_code: destinatario.cep,
            email: destinatario.email,
            complement: destinatario.complemento,
            number: destinatario.numero,
            district: destinatario.bairro,
            document: destinatario.documento
        });
        expect(corpoEtiqueta.options).toEqual({
            tags: [],
            non_commercial: true,
            insurance_value: 0,
            use_insurance_value: false
        });
        expect(corpoEtiqueta.products).toEqual([
            { name: 'Vestuário', quantity: 1, unitary_value: 0 }
        ]);
    });

    it('Deve exibir os detalhes de validação retornados pela SuperFrete', async () => {
        fetch.mockImplementation(criarRotas({
            etiqueta: resposta({
                errors: { 'products.unitary_value': ['(products.unitary_value) é obrigatório.'] },
                message: 'Ocorreu um ou mais erros.'
            }, 400, false)
        }));

        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });

        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');
        await adicionarPrimeiroProduto();
        preencherDestinatario();
        buscarFrete();

        await screen.findByText(/SEDEX - R\$ 25.00/i);
        fireEvent.click(screen.getByText(/Gerar etiqueta/i));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining(
                'products.unitary_value: (products.unitary_value) é obrigatório.'
            ));
        });

        expect(alertSpy).not.toHaveBeenCalledWith(expect.stringContaining('Ocorreu um ou mais erros.'));
    });

    it('Não deve usar dados fixos do remetente no destinatário da etiqueta', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        await adicionarPrimeiroProduto();

        preencherDestinatario();
        buscarFrete();

        await screen.findByText(/SEDEX - R\$ 25.00/i);
        fireEvent.click(screen.getByText(/Gerar etiqueta/i));

        await waitFor(() => {
            expect(fetch.mock.calls.some(([url]) => String(url).endsWith('/frete/etiqueta'))).toBe(true);
        });

        const chamadaEtiqueta = fetch.mock.calls.find(([url]) => String(url).endsWith('/frete/etiqueta'));
        const destinatarioEnviado = JSON.stringify(JSON.parse(chamadaEtiqueta[1].body).to);

        expect(destinatarioEnviado).not.toContain('MANOEL DOMINGOS FERREIRA');
        expect(destinatarioEnviado).not.toContain('GAROPABA');
        expect(destinatarioEnviado).not.toContain('00000000000');
        expect(destinatarioEnviado).not.toContain('suporte@borbolelala.com.br');
        expect(destinatarioEnviado).not.toContain('"Centro"');
        expect(destinatarioEnviado).not.toContain('"100"');
    });

    it('Deve bloquear a geração da etiqueta quando o endereço do destinatário estiver incompleto', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        await adicionarPrimeiroProduto();

        fireEvent.change(screen.getByLabelText(/Nome do destinatário/i), { target: { value: 'Maria da Silva' } });
        fireEvent.change(screen.getByLabelText(/CPF\/CNPJ/i), { target: { value: '12345678901' } });
        fireEvent.change(screen.getByLabelText(/CEP Destino/i), { target: { value: '80000000' } });

        buscarFrete();

        await screen.findByText(/SEDEX - R\$ 25.00/i);
        fireEvent.click(screen.getByText(/Gerar etiqueta/i));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Preencha os dados do destinatário'));
        });

        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Logradouro'));
        expect(fetch.mock.calls.some(([url]) => String(url).endsWith('/frete/etiqueta'))).toBe(false);
    });

    it('Deve alertar quando o CPF/CNPJ informado for inválido', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        await adicionarPrimeiroProduto();

        preencherDestinatario({ documento: '123' });
        buscarFrete();

        await screen.findByText(/SEDEX - R\$ 25.00/i);
        fireEvent.click(screen.getByText(/Gerar etiqueta/i));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('CPF/CNPJ'));
        });

        expect(fetch.mock.calls.some(([url]) => String(url).endsWith('/frete/etiqueta'))).toBe(false);
    });

    it('Deve exibir alerta de sucesso ao finalizar uma venda', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await adicionarPrimeiroProduto();

        const botaoFinalizar = screen.getByText(/Finalizar Venda/i);
        fireEvent.click(botaoFinalizar);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('sucesso'));
        });
    });

    it('Deve salvar o endereço digitado do destinatário ao finalizar a venda', async () => {
        vi.spyOn(window, 'alert').mockImplementation(() => { });

        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await adicionarPrimeiroProduto();

        const destinatario = preencherDestinatario();

        fireEvent.click(screen.getByText(/Finalizar Venda/i));

        await waitFor(() => {
            expect(fetch.mock.calls.some(([url]) => String(url).endsWith('/pedidos'))).toBe(true);
        });

        const chamadaPedido = fetch.mock.calls.find(([url]) => String(url).endsWith('/pedidos'));
        const pedido = JSON.parse(chamadaPedido[1].body);

        expect(pedido.cliente).toBe(destinatario.nome);
        expect(pedido.endereco).toEqual({
            cep: destinatario.cep,
            logradouro: destinatario.logradouro,
            bairro: destinatario.bairro,
            cidade: destinatario.cidade,
            estado: destinatario.uf
        });
    });

    it('Deve filtrar os produtos ao clicar em uma categoria', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        expect(screen.getByText('Vestido Floral')).toBeInTheDocument();
        expect(screen.getByText('Cueca Kids')).toBeInTheDocument();

        const botaoCategoriaVestido = screen.getByText('vestido');
        fireEvent.click(botaoCategoriaVestido);

        expect(screen.getByText('Vestido Floral')).toBeInTheDocument();
        expect(screen.queryByText('Cueca Kids')).not.toBeInTheDocument();
    });

    it('Deve remover um item do carrinho ao clicar na lixeira', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        await adicionarPrimeiroProduto();

        expect(screen.getByText(/1x R\$ 100\.00/i)).toBeInTheDocument();

        const botaoLixeira = screen.getByText('🗑️');
        fireEvent.click(botaoLixeira);

        expect(screen.getByText('O carrinho está vazio.')).toBeInTheDocument();
    });

    it('Deve bloquear e alertar se o usuário tentar adicionar mais do que o estoque disponível', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Cueca Kids');

        const botoesAdicionar = await screen.findAllByText('+ Adicionar');

        for (let i = 0; i < 6; i++) {
            fireEvent.click(botoesAdicionar[1]);
        }

        expect(alertSpy).toHaveBeenCalledWith('Estoque máximo atingido para este produto!');

        expect(screen.getByText(/5x R\$ 20\.00/i)).toBeInTheDocument();
    });

    it('Deve alertar o usuário se o backend retornar erro na finalização da venda', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        fetch.mockImplementation(criarRotas({
            pedido: resposta({ erro: 'Estoque insuficiente no servidor.' }, 400, false)
        }));

        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        await adicionarPrimeiroProduto();

        const botaoFinalizar = screen.getByText(/Finalizar Venda/i);
        fireEvent.click(botaoFinalizar);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Erro: Estoque insuficiente no servidor.'));
        });
    });

    it('Deve gerenciar a abertura e fechamento do drawer do carrinho apenas via botão flutuante', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        // Pega o botão flutuante e o container do carrinho
        const botaoFlutuante = screen.getByTestId('floating-cart-btn');
        const checkoutSidebar = screen.getByText('🛒 Carrinho e Entrega').closest('.pdv-checkout-sidebar');

        // Estado inicial: fechado (não deve ter a classe carrinho-aberto)
        expect(checkoutSidebar).not.toHaveClass('carrinho-aberto');

        // Clicar no botão flutuante -> abre o carrinho (deve ter a classe carrinho-aberto)
        fireEvent.click(botaoFlutuante);
        expect(checkoutSidebar).toHaveClass('carrinho-aberto');

        // Clicar no botão de fechar -> fecha o carrinho
        const botaoFechar = screen.getByRole('button', { name: /Fechar carrinho/i });
        fireEvent.click(botaoFechar);
        expect(checkoutSidebar).not.toHaveClass('carrinho-aberto');

        // Clicar em "+ Adicionar" -> adiciona item mas NÃO abre o carrinho automaticamente
        const botoesAdicionar = await screen.findAllByText('+ Adicionar');
        fireEvent.click(botoesAdicionar[0]);
        expect(checkoutSidebar).not.toHaveClass('carrinho-aberto');
    });
});
