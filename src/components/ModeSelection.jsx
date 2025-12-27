import React from 'react';

export default function ModeSelection({ setTryb }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '60px', maxWidth: '500px', margin: '60px auto' }}>
      <h2 style={{ marginBottom: '40px', color: '#1a202c', fontSize: '24px' }}>Wybierz scenariusz</h2>
      <button onClick={() => setTryb('porownanie')} style={{ width: '100%', padding: '25px', marginBottom: '20px', border: '2px solid #bee3f8', borderRadius: '15px', background: '#ebf8ff', cursor: 'pointer', textAlign: 'left', transition: 'transform 0.1s' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '5px' }}>⚖️ Porównaj IKE vs IKZE</div>
        <div style={{ color: '#4a5568' }}>Sprawdź co się bardziej opłaca przy tej samej kwocie wpłaty.</div>
      </button>
      <button onClick={() => setTryb('wlasny')} style={{ width: '100%', padding: '25px', border: '2px solid #e2e8f0', borderRadius: '15px', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4a5568', marginBottom: '5px' }}>✏️ Kalkulacja własna</div>
        <div style={{ color: '#718096' }}>Wpisz dowolne kwoty dla IKE i IKZE niezależnie.</div>
      </button>
    </div>
  );
}