import { render, screen, fireEvent } from '@testing-library/react';
import ModalConfirmacao from '../components/ModalConfirmacao';
import { vi } from 'vitest';

describe('Componente ModalConfirmacao', () => {
    it('Não deve renderizar nada quando isOpen for falso', () => {
        const { container } = render(
            <ModalConfirmacao
                isOpen={false}
                titulo="Confirmar Ação"
                mensagem="Deseja continuar?"
                onConfirm={() => {}}
                onCancel={() => {}}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('Deve renderizar título, mensagem e botões quando isOpen for verdadeiro', () => {
        render(
            <ModalConfirmacao
                isOpen={true}
                titulo="Confirmar Exclusão"
                mensagem="Deseja mesmo excluir o produto?"
                onConfirm={() => {}}
                onCancel={() => {}}
                confirmText="Sim"
                cancelText="Não"
            />
        );

        expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
        expect(screen.getByText('Deseja mesmo excluir o produto?')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sim' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Não' })).toBeInTheDocument();
    });

    it('Deve disparar onConfirm quando o botão de confirmação for clicado', () => {
        const onConfirmSpy = vi.fn();
        render(
            <ModalConfirmacao
                isOpen={true}
                titulo="Confirmar"
                mensagem="Deseja continuar?"
                onConfirm={onConfirmSpy}
                onCancel={() => {}}
                confirmText="Confirmar"
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
        expect(onConfirmSpy).toHaveBeenCalledTimes(1);
    });

    it('Deve disparar onCancel quando o botão de cancelamento for clicado', () => {
        const onCancelSpy = vi.fn();
        render(
            <ModalConfirmacao
                isOpen={true}
                titulo="Confirmar"
                mensagem="Deseja continuar?"
                onConfirm={() => {}}
                onCancel={onCancelSpy}
                cancelText="Cancelar"
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
        expect(onCancelSpy).toHaveBeenCalledTimes(1);
    });

    it('Não deve renderizar o botão Cancelar quando isAlert for verdadeiro', () => {
        render(
            <ModalConfirmacao
                isOpen={true}
                titulo="Alerta"
                mensagem="Mensagem de aviso"
                onConfirm={() => {}}
                onCancel={() => {}}
                isAlert={true}
                confirmText="Ok"
            />
        );

        expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Ok' })).toBeInTheDocument();
    });
});
