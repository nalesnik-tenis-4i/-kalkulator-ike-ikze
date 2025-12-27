// src/components/CalculatorComponents.jsx
import React from 'react';

// --- STYLING UTILS ---
const cardStyle = { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #e2e8f0' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4a5568', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', boxSizing: 'border-box' };

// 1. INPUT FEE (Opłaty)
export const FeeInput = ({ label, feeData, setFeeData }) => {
  const toggleType = () => {
    setFeeData({ ...feeData, type: feeData.type === 'pln' ? '%' : 'pln' });
  };

  const handleChange = (e) => {
    const val = e.target.value;
    // Jeśli puste, ustawiamy 0 w state, ale input wyświetli pusty string dzięki value={... || ''}
    setFeeData({ ...feeData, value: val === '' ? 0 : Number(val) });
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <label style={{...labelStyle, fontSize: '11px', color: '#718096'}}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e0', borderRadius: '6px', background: '#fff' }}>
        <input 
          type="number" 
          step={feeData.type === '%' ? "0.1" : "1"}
          value={feeData.value || ''} 
          onChange={handleChange}
          style={{ ...inputStyle, border: 'none', flex: 1 }} 
        />
        <button 
          onClick={toggleType}
          style={{ 
            border: 'none', 
            background: '#edf2f7', 
            padding: '8px 12px', 
            fontSize: '12px', 
            fontWeight: 'bold', 
            color: '#4a5568',
            borderLeft: '1px solid #cbd5e0',
            cursor: 'pointer',
            borderRadius: '0 6px 6px 0',
            minWidth: '50px'
          }}
        >
          {feeData.type === 'pln' ? 'PLN' : '%'}
        </button>
      </div>
      <div style={{ fontSize: '10px', color: '#a0aec0', marginTop: '2px', textAlign: 'right' }}>
        {feeData.type === 'pln' ? 'rocznie' : 'aktywów rocznie'}
      </div>
    </div>
  );
};

// 2. WYNIKI (Kafelki)
export const SummaryResults = ({ final, reinwestuj }) => {
  const diff = final.IKZE - final.IKE;
  const winner = diff > 0 ? 'IKZE' : 'IKE';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
        {/* IKE */}
        <div style={{ padding: '15px', background: '#ebf8ff', borderRadius: '10px', textAlign: 'center', border: '1px solid #bee3f8' }}>
          <div style={{ fontSize: '11px', color: '#2c5282', fontWeight: 'bold', textTransform: 'uppercase' }}>IKE (Do ręki)</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#2b6cb0', marginTop: '5px' }}>
            {final.IKE.toLocaleString()} zł
          </div>
        </div>
        
        {/* IKZE */}
        <div style={{ padding: '15px', background: '#f0fff4', borderRadius: '10px', textAlign: 'center', border: '1px solid #c6f6d5' }}>
          <div style={{ fontSize: '11px', color: '#22543d', fontWeight: 'bold', textTransform: 'uppercase' }}>IKZE (Do ręki)</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#2f855a', marginTop: '5px' }}>
            {final.IKZE.toLocaleString()} zł
          </div>
          <div style={{fontSize: '10px', color: '#38a169', marginTop: '5px'}}>
            (netto + {reinwestuj ? 'zainwestowane' : 'odłożone'} zwroty)
          </div>
        </div>
      </div>

      {/* WINNER BAR */}
      <div style={{ 
        padding: '12px', 
        background: '#fff', 
        border: `2px solid ${winner === 'IKZE' ? '#48bb78' : '#4299e1'}`,
        borderRadius: '8px', 
        textAlign: 'center',
        color: '#2d3748'
      }}>
        <strong style={{ color: winner === 'IKZE' ? '#2f855a' : '#2b6cb0' }}>
          🏆 {winner} wygrywa o {Math.abs(diff).toLocaleString()} zł
        </strong>
        <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>
           przy założonym okresie inwestycji
        </div>
      </div>
    </div>
  );
};