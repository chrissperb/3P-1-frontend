// Recebemos as "props" (titulo, valor, corBorda) diretamente na função do componente
export default function CardResumo({ titulo, valor, corBorda = '#9b59b6' }) {
    return (
        <div style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            minWidth: '220px',
            flex: '1', // Faz os cards dividirem o espaço igualmente
            borderLeft: `5px solid ${corBorda}` // Usamos a prop de cor aqui!
        }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                {titulo}
            </h4>
            <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: '#2c3e50' }}>
                {valor}
            </p>
        </div>
    );
}