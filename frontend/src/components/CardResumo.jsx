// Recebemos as "props" (titulo, valor, corBorda) diretamente na função do componente
export default function CardResumo({ titulo, valor, corBorda = '#9b59b6' }) {
    return (
        <div className="card-resumo" style={{ borderLeft: `5px solid ${corBorda}` }}>
            <h4 className="card-resumo-titulo">
                {titulo}
            </h4>
            <p className="card-resumo-valor">
                {valor}
            </p>
        </div>
    );
}