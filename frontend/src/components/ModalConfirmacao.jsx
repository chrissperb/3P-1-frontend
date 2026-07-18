import React from 'react';

export default function ModalConfirmacao({
    isOpen,
    titulo,
    mensagem,
    onConfirm,
    onCancel,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    tipo = "info",
    isAlert = false
}) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" data-testid="modal-confirmacao">
            <div className="modal-card-confirmacao">
                <div className="modal-confirmacao-header">
                    <h3>{titulo}</h3>
                </div>
                <div className="modal-confirmacao-body">
                    <p>{mensagem}</p>
                </div>
                <div className="modal-confirmacao-footer">
                    {!isAlert && (
                        <button 
                            type="button" 
                            onClick={onCancel} 
                            className="btn-modal btn-modal-cancelar"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        className={`btn-modal ${tipo === 'danger' ? 'btn-modal-confirmar-danger' : 'btn-modal-confirmar'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
