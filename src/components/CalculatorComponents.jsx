import React from 'react';

// --- STYLING UTILS ---
const cardStyle = { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #e2e8f0' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4a5568', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', boxSizing: 'border-box' };

// 1. INPUT FEE (Opłaty)
export const FeeInput = ({ label, feeData, setFeeData }) => {
  const toggleType = (newType) => {
    setFeeData({ ...feeData, type: newType });
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setFeeData({ ...feeData, value: val === '' ? 0 : Number(val) });
  };

  // Używamy TURKUSU (#00A8BB) dla aktywnego
  const activeBtnStyle = {
    background: '#00A8BB', color: '#fff', border: '1px solid #00A8BB', cursor: 'default'
  };
  const inactiveBtnStyle = {
    background: '#fff', color: '#B2B2B2', border: '1px solid #e2e8f0', cursor: 'pointer'
  };
  const btnBaseStyle = {
    flex: 1, padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', 
    transition: 'all 0.2s'
  };

  return (
    <div style={{ marginTop: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{...labelStyle, marginBottom: 0, fontSize: '11px', color: '#B2B2B2'}}>{label}</label>
        
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
        <span style={{ position: 'absolute', right: '10px', fontSize: '12px', color: '#B2B2B2', pointerEvents: 'none' }}>
           {feeData.type === 'pln' ? 'zł' : '%'}
        </span>
      </div>
      <div style={{ fontSize: '10px', color: '#B2B2B2', marginTop: '3px', textAlign: 'right' }}>
        {feeData.type === 'pln' ? 'pobierane rocznie' : 'aktywów rocznie'}
      </div>
    </div>
  );
};

// 2. WYNIKI (Kafelki) - Zaktualizowane kolory
export const SummaryResults = ({ final, reinwestuj }) => {
  const diff = final.IKZE - final.IKE;
  const winner = diff > 0 ? 'IKZE' : 'IKE';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
        
        {/* IKE - TURKUS */}
        <div style={{ padding: '15px', background: 'rgba(0, 168, 187, 0.05)', borderRadius: '10px', textAlign: 'center', border: '1px solid #00A8BB' }}>
          <div style={{ fontSize: '11px', color: '#00A8BB', fontWeight: 'bold', textTransform: 'uppercase' }}>IKE (po wypłacie netto)</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#00A8BB', marginTop: '5px' }}>
            {final.IKE.toLocaleString()} zł
          </div>
        </div>
        
        {/* IKZE - ZŁOTO */}
        <div style={{ padding: '15px', background: 'rgba(212, 160, 23, 0.05)', borderRadius: '10px', textAlign: 'center', border: '1px solid #D4A017' }}>
          <div style={{ fontSize: '11px', color: '#D4A017', fontWeight: 'bold', textTransform: 'uppercase' }}>IKZE (po wypłacie netto)</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#D4A017', marginTop: '5px' }}>
            {final.IKZE.toLocaleString()} zł
          </div>
          <div style={{fontSize: '10px', color: '#B2B2B2', marginTop: '5px'}}>
            (kapitał + {reinwestuj ? 'zainwestowane' : 'odłożone'} zwroty)
          </div>
        </div>
      </div>

      {/* WINNER BAR - KORALOWY */}
      <div style={{ 
        padding: '12px', 
        background: '#fff', 
        border: `2px solid #F16A61`,
        borderRadius: '8px', 
        textAlign: 'center',
        color: '#2d3748'
      }}>
        <strong style={{ color: '#F16A61' }}>
          🏆 {winner} wygrywa o {Math.abs(diff).toLocaleString()} zł
        </strong>
        <div style={{ fontSize: '11px', color: '#B2B2B2', marginTop: '4px' }}>
           przy założonym okresie inwestycji
        </div>
      </div>
    </div>
  );
};