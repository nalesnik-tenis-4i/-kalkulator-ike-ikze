// src/components/CalculatorComponents.jsx
import React from 'react';

// --- STYLING UTILS ---
const cardStyle = { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #e2e8f0' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4a5568', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', boxSizing: 'border-box' };

// 1. INPUT FEE (Opłaty) - ZMODYFIKOWANY WYGLĄD
export const FeeInput = ({ label, feeData, setFeeData }) => {
  const toggleType = (newType) => {
    setFeeData({ ...feeData, type: newType });
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setFeeData({ ...feeData, value: val === '' ? 0 : Number(val) });
  };

  const activeBtnStyle = {
    background: '#3182ce', color: '#fff', border: '1px solid #3182ce', cursor: 'default'
  };
  const inactiveBtnStyle = {
    background: '#edf2f7', color: '#4a5568', border: '1px solid #cbd5e0', cursor: 'pointer'
  };
  const btnBaseStyle = {
    flex: 1, padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', 
    transition: 'all 0.2s'
  };

  return (
    <div style={{ marginTop: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{...labelStyle, marginBottom: 0, fontSize: '11px', color: '#718096'}}>{label}</label>
        
        {/* NOWY PRZEŁĄCZNIK JEDNOSTKI */}
        <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden' }}>
          <button 
            onClick={() => toggleType('pln')}
            style={{ ...btnBaseStyle, ...(feeData.type === 'pln' ? activeBtnStyle : inactiveBtnStyle) }}
          >
            PLN
          </button>
          <button 
            onClick={() => toggleType('%')}
            style={{ ...btnBaseStyle, ...(feeData.type === '%' ? activeBtnStyle : inactiveBtnStyle), borderLeft: 'none' }}
          >
            %
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <input 
          type="number" 
          step={feeData.type === '%' ? "0.1" : "1"}
          value={feeData.value || ''} 
          onChange={handleChange}
          style={{ ...inputStyle }} 
          placeholder="0"
        />
        <span style={{ position: 'absolute', right: '10px', fontSize: '12px', color: '#a0aec0', pointerEvents: 'none' }}>
           {feeData.type === 'pln' ? 'zł' : '%'}
        </span>
      </div>
      <div style={{ fontSize: '10px', color: '#a0aec0', marginTop: '3px', textAlign: 'right' }}>
        {feeData.type === 'pln' ? 'pobierane rocznie' : 'aktywów rocznie'}
      </div>
    </div>
  );
};

// 2. WYNIKI (Kafelki) - ZMIANA TEKSTU
export const SummaryResults = ({ final, reinwestuj }) => {
  const diff = final.IKZE - final.IKE;
  const winner = diff > 0 ? 'IKZE' : 'IKE';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
        {/* IKE */}
        <div style={{ padding: '15px', background: '#ebf8ff', borderRadius: '10px', textAlign: 'center', border: '1px solid #bee3f8' }}>
          <div style={{ fontSize: '11px', color: '#2c5282', fontWeight: 'bold', textTransform: 'uppercase' }}>IKE (po wypłacie netto)</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#2b6cb0', marginTop: '5px' }}>
            {final.IKE.toLocaleString()} zł
          </div>
        </div>
        
        {/* IKZE */}
        <div style={{ padding: '15px', background: '#f0fff4', borderRadius: '10px', textAlign: 'center', border: '1px solid #c6f6d5' }}>
          <div style={{ fontSize: '11px', color: '#22543d', fontWeight: 'bold', textTransform: 'uppercase' }}>IKZE (po wypłacie netto)</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#2f855a', marginTop: '5px' }}>
            {final.IKZE.toLocaleString()} zł
          </div>
          <div style={{fontSize: '10px', color: '#38a169', marginTop: '5px'}}>
            (kapitał + {reinwestuj ? 'zainwestowane' : 'odłożone'} zwroty)
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