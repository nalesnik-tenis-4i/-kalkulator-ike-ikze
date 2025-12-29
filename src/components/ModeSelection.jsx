import React from 'react';

export default function ModeSelection({ setTryb }) {
  
  const cardStyle = {
    width: '100%', padding: '25px', marginBottom: '20px', 
    border: '2px solid transparent', borderRadius: '15px', 
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
    display: 'block' 
  };

  const titleStyle = { fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' };
  const descStyle = { color: '#B2B2B2', fontSize: '14px' };

  return (
    <div style={{ textAlign: 'center', marginTop: '40px', maxWidth: '600px', margin: '40px auto' }}>
      <h2 style={{ marginBottom: '30px', color: '#1a202c', fontSize: '24px' }}>Wybierz scenariusz</h2>
      
      {/* 1. PORÓWNANIE */}
      <button 
        onClick={() => setTryb('porownanie')} 
        style={{ ...cardStyle, background: 'rgba(0, 168, 187, 0.05)', borderColor: '#00A8BB' }}
      >
        <div style={{ ...titleStyle, color: '#00A8BB' }}>⚖️ Porównanie IKE vs IKZE 1:1</div>
        <div style={descStyle}>Sprawdź co się bardziej opłaca przy tej samej kwocie wpłaty.</div>
      </button>

      {/* 2. WŁASNY */}
      <button 
        onClick={() => setTryb('wlasny')} 
        style={{ ...cardStyle, background: '#fff', borderColor: '#e2e8f0' }}
      >
        <div style={{ ...titleStyle, color: '#2d3748' }}>✏️ Kalkulacja własna</div>
        <div style={descStyle}>Wpisz dowolne kwoty dla IKE i IKZE niezależnie.</div>
      </button>

      {/* 3. PRO */}
      <button 
        onClick={() => setTryb('pro')} 
        style={{ ...cardStyle, background: '#2d3748', borderColor: '#4a5568' }}
      >
        <div style={{ ...titleStyle, color: '#f7fafc' }}>🚀 Wersja PRO (Desktop)</div>
        <div style={{ color: '#a0aec0', fontSize: '14px' }}>Szczegółowa tabela, pełna analiza i edycja zaawansowana.</div>
      </button>
    </div>
  );
}