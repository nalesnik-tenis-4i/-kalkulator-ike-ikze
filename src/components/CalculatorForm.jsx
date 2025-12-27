import React, { useState } from 'react';
import { taxes } from '../calculations';
import { FeeInput } from './CalculatorComponents';
import { validateAge, validateRetirementAge, sanitizePercentage } from '../validators';

export default function CalculatorForm(props) {
  const {
    tryb, rok, setRok, dostepneLata,
    wiek, setWiek, wiekEmerytura, setWiekEmerytura,
    podatek, setPodatek, czyFirma, setCzyFirma,
    iloscWplatRok, setIloscWplatRok,
    wspolnaKwota, setWspolnaKwota, limitWspolny,
    wplataIKE, setWplataIKE, limitIKE,
    wplataIKZE, setWplataIKZE, limitIKZE,
    stopaZwrotu, setStopaZwrotu,
    reinwestuj, setReinwestuj,
    stopaZwrotuUlga, setStopaZwrotuUlga,
    oplatyIKE, setOplatyIKE,
    oplatyIKZE, setOplatyIKZE
  } = props;

  // --- STANY DLA WALIDACJI ---
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  // Style
  const cardStyle = { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' };
  const inputStyle = (hasError) => ({
    width: '100%', padding: '10px', borderRadius: '8px', 
    border: hasError ? '2px solid #e53e3e' : '1px solid #cbd5e0', 
    fontSize: '15px', boxSizing: 'border-box', outline: 'none'
  });
  const errorMsgStyle = { color: '#e53e3e', fontSize: '11px', marginTop: '4px', fontWeight: 'bold' };
  const warningMsgStyle = { color: '#d69e2e', fontSize: '11px', marginTop: '4px' };

  // --- OBSŁUGA ZMIAN Z WALIDACJĄ ---

  const handleAgeChange = (val) => {
    // 1. Ustaw wartość (żeby UI reagowało)
    const num = val === '' ? '' : Number(val);
    setWiek(num);
    
    // 2. Waliduj
    const error = validateAge(num);
    setErrors(prev => ({ ...prev, wiek: error }));
  };

  const handleRetirementChange = (val) => {
    const num = val === '' ? '' : Number(val);
    setWiekEmerytura(num);
    const error = validateRetirementAge(num);
    setErrors(prev => ({ ...prev, wiekEmerytura: error }));
  };

  const handlePercentageChange = (val, setter, fieldName) => {
    // Sanityzacja (obcina do 2 miejsc, sprawdza zakres)
    const { value, warning } = sanitizePercentage(val);
    
    // Ustawiamy sanitarną wartość (lub surową jeśli chcemy pozwolić pisać, ale tu narzucamy rygor)
    // Aby input działał płynnie (np. kropka), musimy pozwolić na wpisywanie, 
    // ale sanitizePercentage zwraca sformatowany number.
    // Prostsze podejście: ustawiamy to co wpisał user, ale ostrzeżenie wyświetlamy.
    
    setter(value); 
    setWarnings(prev => ({ ...prev, [fieldName]: warning }));
  };

  const handleNumericChange = (val, setter, maxLimit = null) => {
    if (val === '') {
      setter(0);
      return;
    }
    let num = Number(val);
    if (isNaN(num)) return;
    if (maxLimit !== null && num > maxLimit) num = maxLimit;
    setter(num);
  };

  return (
    <>
      {/* --- 1. DANE OSOBOWE --- */}
      <div style={cardStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          
          {/* WIEK OBECNY */}
          <div>
            <label style={labelStyle}>Wiek obecny</label>
            <input 
              type="number" 
              value={wiek || ''} 
              onChange={(e) => handleAgeChange(e.target.value)} 
              style={inputStyle(errors.wiek)} 
            />
            {errors.wiek && <div style={errorMsgStyle}>{errors.wiek}</div>}
          </div>

          {/* WIEK EMERYTURY */}
          <div>
            <label style={labelStyle}>Wiek emerytury</label>
            <input 
              type="number" 
              value={wiekEmerytura || ''} 
              onChange={(e) => handleRetirementChange(e.target.value)} 
              style={inputStyle(errors.wiekEmerytura)} 
            />
            {errors.wiekEmerytura && <div style={errorMsgStyle}>{errors.wiekEmerytura}</div>}
          </div>

          {/* ROK LIMITÓW */}
          <div>
            <label style={labelStyle}>Rok limitów</label>
            <select value={rok} onChange={(e) => setRok(Number(e.target.value))} style={inputStyle(false)}>
              {dostepneLata.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', borderTop: '1px solid #edf2f7', paddingTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Twój podatek (do ulgi IKZE)</label>
            <select value={podatek} onChange={(e) => setPodatek(Number(e.target.value))} style={inputStyle(false)}>
              {(czyFirma ? taxes.b2b : taxes.etat).map(t => <option key={t.label} value={t.value}>{t.label}</option>)}
            </select>
            <div style={{ marginTop: '8px' }}>
              <label style={{ fontSize: '12px', color: '#4a5568', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={czyFirma} onChange={(e) => setCzyFirma(e.target.checked)} style={{ marginRight: '8px' }} />
                Działalność gospodarcza (B2B)
              </label>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Częstotliwość wpłat</label>
            <select value={iloscWplatRok} onChange={(e) => setIloscWplatRok(Number(e.target.value))} style={inputStyle(false)}>
              <option value="12">Co miesiąc (12)</option>
              <option value="4">Co kwartał (4)</option>
              <option value="1">Raz w roku (1)</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- 2. WPŁATY --- */}
      {tryb === 'porownanie' ? (
        <div style={{ ...cardStyle, background: '#ebf8ff', borderColor: '#bee3f8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ ...labelStyle, marginBottom: 0, color: '#2c5282' }}>Wspólna kwota inwestycji (rocznie)</label>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2b6cb0' }}>{wspolnaKwota.toLocaleString()} zł</span>
          </div>
          
          {/* SUWAK - STEP=1 dla dokładności */}
          <input 
            type="range" 
            min="0" 
            max={limitWspolny} 
            step="1" 
            value={wspolnaKwota} 
            onChange={(e) => setWspolnaKwota(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#3182ce', marginBottom: '15px' }} 
          />
          
          <div style={{ display: 'flex', gap: '10px' }}>
             <input 
               type="number" 
               value={wspolnaKwota || ''} 
               onChange={(e) => handleNumericChange(e.target.value, setWspolnaKwota, limitWspolny)} 
               style={inputStyle(false)} 
             />
             <button onClick={() => setWspolnaKwota(limitWspolny)} style={{ background: '#3182ce', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 20px', fontWeight: 'bold', cursor: 'pointer' }}>
               MAX
             </button>
          </div>
          <div style={{ fontSize: '11px', color: '#5a67d8', marginTop: '10px', textAlign: 'center' }}>
            Limit ograniczony do: {limitWspolny.toLocaleString()} zł
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          {/* KARTA IKE */}
          <div style={{ ...cardStyle, background: '#f7fafc', borderColor: '#cbd5e0', marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <strong style={{ color: '#2b6cb0' }}>IKE</strong>
              <span style={{ fontSize: '11px', color: '#718096' }}>Max: {limitIKE}</span>
            </div>
            <input 
              type="number" 
              value={wplataIKE || ''} 
              onChange={(e) => handleNumericChange(e.target.value, setWplataIKE, limitIKE)} 
              style={inputStyle(false)} 
            />
          </div>
          {/* KARTA IKZE */}
          <div style={{ ...cardStyle, background: '#f7fafc', borderColor: '#cbd5e0', marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <strong style={{ color: '#276749' }}>IKZE</strong>
              <span style={{ fontSize: '11px', color: '#718096' }}>Max: {limitIKZE}</span>
            </div>
            <input 
              type="number" 
              value={wplataIKZE || ''} 
              onChange={(e) => handleNumericChange(e.target.value, setWplataIKZE, limitIKZE)} 
              style={inputStyle(false)} 
            />
          </div>
        </div>
      )}

      {/* --- 3. PARAMETRY RYNKOWE --- */}
      <div style={{ ...cardStyle }}>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {/* ZYSKI */}
            <div>
              <label style={labelStyle}>Śr. roczny zwrot (%)</label>
              <input 
                type="number" 
                step="0.5" 
                value={stopaZwrotu || ''} 
                onChange={(e) => handlePercentageChange(e.target.value, setStopaZwrotu, 'zwrot')} 
                style={inputStyle(false)} 
              />
              {warnings.zwrot && <div style={warningMsgStyle}>{warnings.zwrot}</div>}
              
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: '500', cursor: 'pointer', color: '#2d3748' }}>
                   <input type="checkbox" checked={reinwestuj} onChange={(e) => setReinwestuj(e.target.checked)} style={{ marginRight: '8px', accentColor: '#38a169' }} />
                   Reinwestuję zwrot z IKZE
                </label>
                {reinwestuj ? (
                  <div style={{ marginTop: '8px', paddingLeft: '24px' }}>
                    <label style={{ fontSize: '11px', color: '#718096' }}>Zysk z reinwestycji (%):</label>
                    <input 
                      type="number" 
                      step="0.5" 
                      value={stopaZwrotuUlga || ''} 
                      onChange={(e) => handlePercentageChange(e.target.value, setStopaZwrotuUlga, 'ulga')} 
                      style={{ ...inputStyle(false), padding: '6px', fontSize: '13px' }} 
                    />
                    {warnings.ulga && <div style={warningMsgStyle}>{warnings.ulga}</div>}
                  </div>
                ) : (
                   <div style={{ marginTop: '8px', paddingLeft: '24px', fontSize: '11px', color: '#a0aec0' }}>
                     Zwrot podatku trafia do kieszeni
                   </div>
                )}
              </div>
            </div>

            {/* OPŁATY */}
            <div style={{ borderLeft: '1px solid #edf2f7', paddingLeft: '20px' }}>
               <label style={labelStyle}>Opłaty roczne (Konta)</label>
               <FeeInput label="Opłata IKE" feeData={oplatyIKE} setFeeData={setOplatyIKE} />
               <FeeInput label="Opłata IKZE" feeData={oplatyIKZE} setFeeData={setOplatyIKZE} />
            </div>
         </div>
      </div>
    </>
  );
}