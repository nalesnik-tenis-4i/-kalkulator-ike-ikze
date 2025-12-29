import React from 'react';

// Formatowanie waluty
const f = (n) => n ? Math.round(n).toLocaleString('pl-PL') : '0';

// --- STYLE ---
const thStyle = { padding: '12px 8px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: '#B2B2B2', borderBottom: '2px solid #e2e8f0', backgroundColor: '#f9f9f9', whiteSpace: 'nowrap' };
const tdStyle = { padding: '8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontSize: '12px', verticalAlign: 'middle' };
const inputClass = (val, limit) => val > limit ? "pro-table-input limit-warning" : "pro-table-input";

const toolbarInputStyle = { padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', width: '80px', textAlign: 'center', fontWeight: 'bold', color: '#2d3748' };
const toolbarLabelStyle = { fontSize: '12px', color: '#B2B2B2', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' };

// --- POMOCNICZY KOMPONENT: KOMÓRKA PODATKU ---
const TaxCell = ({ row, updateRow }) => {
  // Opcje standardowe
  const options = [
    { label: '12%', value: 0.12 },
    { label: '32%', value: 0.32 }
  ];
  
  // Dla firmy dochodzi Liniowy 19%
  if (row.isCompany) {
    options.push({ label: '19%', value: 0.19 });
  }

  // Logika zmiany selecta
  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      updateRow(row.id, 'isTaxCustom', true); // Przełącz na tryb ręczny
      updateRow(row.id, 'taxRate', 0); // Reset lub domyślna dla ryczałtu
    } else {
      updateRow(row.id, 'taxRate', Number(val));
    }
  };

  // 1. TRYB RĘCZNY (Input) - tylko dla firmy po wybraniu "Inny"
  if (row.isCompany && row.isTaxCustom) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
        <input 
          type="number" step="0.005" 
          value={row.taxRate} 
          onChange={(e) => updateRow(row.id, 'taxRate', e.target.value)} 
          style={{ width: '45px', fontSize: '11px', border: '1px solid #F16A61', borderRadius: '4px', textAlign: 'right', padding: '2px' }} 
          title="Wpisz stawkę (np. 0.085 dla 8,5%)"
        />
        <button 
          onClick={() => updateRow(row.id, 'isTaxCustom', false)}
          style={{ border: 'none', background: 'transparent', color: '#B2B2B2', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
          title="Wróć do listy"
        >
          ✕
        </button>
      </div>
    );
  }

  // 2. TRYB LISTY (Select)
  return (
    <select 
      value={options.some(o => o.value === row.taxRate) ? row.taxRate : 'CUSTOM'} // Jeśli wartość nie pasuje do listy, pokazujemy Custom (lub najbliższy)
      onChange={handleSelectChange}
      style={{ 
        width: '100%', border: 'none', background: 'transparent', 
        fontSize: '11px', textAlign: 'right', direction: 'rtl', 
        color: '#2d3748', cursor: 'pointer', borderBottom: '1px solid #cbd5e0' 
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
      {/* Opcja "Inny" tylko dla firmy */}
      {row.isCompany && <option value="CUSTOM">Inny / Ryczałt</option>}
    </select>
  );
};


// --- 1. TOOLBAR ---
export const ProToolbar = ({ 
  localAge, setLocalAge, 
  localRetAge, setLocalRetAge, 
  startYear, setStartYear,
  fillMax, clearAll 
}) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      
      {/* DANE */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <label style={toolbarLabelStyle}>Wiek obecny (2025)</label>
          <input type="number" value={localAge} onChange={(e) => setLocalAge(Number(e.target.value))} style={toolbarInputStyle} />
        </div>
        <div>
          <label style={toolbarLabelStyle}>Wiek Emerytury</label>
          <input type="number" value={localRetAge} onChange={(e) => setLocalRetAge(Number(e.target.value))} style={toolbarInputStyle} />
        </div>
        <div>
          <label style={toolbarLabelStyle}>
            Rok startu arkusza kalkulacyjnego
            <div 
              style={{ cursor: 'help', fontSize: '14px' }} 
              title="Jeśli zaczęłaś_eś inwestować przed 2025 - wpisz rok pierwszej wpłaty, aby odtworzyć historię wpłat."
            >
              ℹ️
            </div>
          </label>
          <input type="number" value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} style={toolbarInputStyle} />
        </div>
      </div>

      {/* AKCJE */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={fillMax} style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '600', background: '#00A8BB', color: '#fff', border: '1px solid #00A8BB', borderRadius: '8px', cursor: 'pointer' }}>
           Wypełnij MAX
        </button>
        <button onClick={clearAll} style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '600', background: '#fff', color: '#F16A61', border: '1px solid #F16A61', borderRadius: '8px', cursor: 'pointer' }}>
           Wyczyść
        </button>
      </div>
    </div>
    <div style={{ fontSize: '12px', color: '#B2B2B2', marginTop: '10px', fontStyle: 'italic' }}>
      * Zmiana wieku lub roku startu zresetuje wpisane dane w tabeli.
    </div>
  </div>
);

// --- 2. PODGLĄD MIESIĘCZNY ---
const MonthlyDetails = ({ yearData, prevCapitalIKE, prevCapitalIKZE }) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const stopa = yearData.stopa || 0;
  const rMies = (stopa / 100) / 12;
  const wplataIKE_mc = (yearData.wplataIKE || 0) / 12;
  const wplataIKZE_mc = (yearData.wplataIKZE || 0) / 12;

  let tempIKE = prevCapitalIKE;
  let tempIKZE = prevCapitalIKZE;

  return (
    <tr style={{ backgroundColor: '#fafafa' }}>
      <td colSpan="100%" style={{ padding: '0' }}>
        <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
          <strong style={{ fontSize: '12px', color: '#B2B2B2', display: 'block', marginBottom: '10px' }}>
            📅 Symulacja miesięczna dla roku {yearData.rok} (Oprocentowanie: {stopa}%)
          </strong>
          <table style={{ width: '100%', minWidth: '600px', fontSize: '11px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#B2B2B2' }}>
                <th style={{ textAlign: 'left', padding: '4px' }}>Miesiąc</th>
                <th style={{ textAlign: 'right', padding: '4px' }}>Wpłata IKE</th>
                <th style={{ textAlign: 'right', padding: '4px' }}>IKE Kapitał</th>
                <th style={{ textAlign: 'right', padding: '4px' }}>Wpłata IKZE</th>
                <th style={{ textAlign: 'right', padding: '4px' }}>IKZE Kapitał</th>
              </tr>
            </thead>
            <tbody>
              {months.map(m => {
                tempIKE = tempIKE * (1 + rMies) + wplataIKE_mc;
                tempIKZE = tempIKZE * (1 + rMies) + wplataIKZE_mc;
                return (
                  <tr key={m} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '4px', color: '#B2B2B2' }}>{m}</td>
                    <td style={{ padding: '4px', textAlign: 'right', color: '#00A8BB' }}>+{wplataIKE_mc.toFixed(0)}</td>
                    <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold', color: '#2d3748' }}>{f(tempIKE)}</td>
                    <td style={{ padding: '4px', textAlign: 'right', color: '#D4A017' }}>+{wplataIKZE_mc.toFixed(0)}</td>
                    <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold', color: '#2d3748' }}>{f(tempIKZE)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
};

// --- 3. TABELA GŁÓWNA ---
export const ProTable = ({ results, updateRow, toggleExpand }) => (
  <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
    <table style={{ width: '100%', minWidth: '1350px', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{...thStyle, textAlign: 'left', width: '30px'}}></th>
          <th style={{...thStyle, textAlign: 'left'}}>Rok (Wiek)</th>
          
          <th style={{...thStyle, color: '#F16A61', borderLeft: '1px solid #e2e8f0'}}>B2B?</th>
          <th style={{...thStyle, color: '#F16A61'}}>Podatek</th>

          {/* IKE */}
          <th style={{...thStyle, color: '#00A8BB', borderLeft: '1px solid #e2e8f0'}}>Limit IKE</th>
          <th style={{...thStyle, color: '#00A8BB', width: '90px'}}>Wpłata IKE</th>
          <th style={{...thStyle, color: '#00A8BB'}}>Kapitał IKE</th>

          {/* IKZE */}
          <th style={{...thStyle, color: '#D4A017', borderLeft: '1px solid #e2e8f0'}}>Limit IKZE</th>
          <th style={{...thStyle, color: '#D4A017', width: '90px'}}>Wpłata IKZE</th>
          <th style={{...thStyle, color: '#D4A017'}}>Kapitał IKZE</th>
          
          {/* REINWESTYCJA */}
          <th style={{...thStyle, color: '#F16A61', borderLeft: '1px solid #e2e8f0', textAlign: 'center', width: '150px'}}>
             Reinwestycja<br/>oszczędności z IKZE
          </th>
          <th style={{...thStyle, color: '#F16A61', width: '90px'}}>Kwota Zwrotu</th>
          <th style={{...thStyle, color: '#F16A61'}}>% Zysk</th>
          
          <th style={{...thStyle, borderLeft: '1px solid #e2e8f0'}}>Zysk Rynkowy</th>
        </tr>
      </thead>
      <tbody>
        {results.map((row, idx) => {
          const prevCapitalIKE = idx > 0 ? results[idx-1].endIKE : 0;
          const prevCapitalIKZE = idx > 0 ? results[idx-1].endIKZE : 0;
          const hasAccumulatedCapital = idx > 0 && results[idx-1].accTaxReturn > 1; 
          const isReinvestActive = row.isReinvesting || hasAccumulatedCapital;
          
          return (
            <React.Fragment key={row.id}>
              <tr style={{ backgroundColor: row.id % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                <td style={tdStyle}>
                  <button onClick={() => toggleExpand(row.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#B2B2B2' }}>
                    {row.expanded ? '▼' : '▶'}
                  </button>
                </td>
                <td style={{...tdStyle, textAlign: 'left', fontWeight: '600', color: '#2d3748'}}>
                  {row.rok} <span style={{ color: '#B2B2B2', fontWeight: 'normal', fontSize: '10px' }}>({Math.floor(row.wiek)}l.)</span>
                </td>

                {/* B2B Checkbox */}
                <td style={{...tdStyle, borderLeft: '1px solid #f1f5f9', textAlign: 'center'}}>
                  <input type="checkbox" checked={row.isCompany} onChange={(e) => updateRow(row.id, 'isCompany', e.target.checked)} style={{ cursor: 'pointer', accentColor: '#F16A61' }} />
                </td>
                
                {/* Podatek - Sprytny Komponent */}
                <td style={tdStyle}>
                  <TaxCell row={row} updateRow={updateRow} />
                </td>
                
                {/* IKE */}
                <td style={{...tdStyle, color: '#B2B2B2', borderLeft: '1px solid #f1f5f9'}}>{f(row.limitIKE)}</td>
                <td style={tdStyle}>
                  <input type="number" value={row.wplataIKE === 0 ? '' : row.wplataIKE} placeholder="0" onChange={(e) => updateRow(row.id, 'wplataIKE', e.target.value)} className={inputClass(row.wplataIKE, row.limitIKE)} />
                  {row.wplataIKE > row.limitIKE && <div style={{fontSize:'9px', color: '#F16A61'}}>Limit!</div>}
                </td>
                <td style={{...tdStyle, fontWeight: '700', color: '#00A8BB'}}>{f(row.endIKE)}</td>

                {/* IKZE */}
                <td style={{...tdStyle, color: '#B2B2B2', borderLeft: '1px solid #f1f5f9'}}>{f(row.effectiveLimitIKZE)}</td>
                <td style={tdStyle}>
                   <input type="number" value={row.wplataIKZE === 0 ? '' : row.wplataIKZE} placeholder="0" onChange={(e) => updateRow(row.id, 'wplataIKZE', e.target.value)} className={inputClass(row.wplataIKZE, row.effectiveLimitIKZE)} />
                </td>
                <td style={{...tdStyle, fontWeight: '700', color: '#D4A017'}}>{f(row.endIKZE)}</td>

                {/* REINWESTYCJA */}
                <td style={{...tdStyle, borderLeft: '1px solid #f1f5f9', textAlign: 'center', background: row.isReinvesting ? '#FFF5F5' : 'transparent'}}>
                   <input type="checkbox" checked={row.isReinvesting} onChange={(e) => updateRow(row.id, 'isReinvesting', e.target.checked)} style={{ cursor: 'pointer', accentColor: '#F16A61' }} />
                </td>
                <td style={{...tdStyle, background: row.isReinvesting ? '#FFF5F5' : 'transparent', color: row.isReinvesting ? '#F16A61' : '#cbd5e0' }}>
                   {f(row.wplataIKZE * row.taxRate)}
                </td>
                <td style={{...tdStyle, background: isReinvestActive ? '#FFF5F5' : 'transparent'}}>
                   <input 
                     type="number" step="0.5" 
                     value={row.reinvestRate} 
                     disabled={!isReinvestActive}
                     onChange={(e) => updateRow(row.id, 'reinvestRate', e.target.value)} 
                     style={{ width: '35px', textAlign: 'center', border: 'none', background: 'transparent', borderBottom: isReinvestActive ? '1px solid #F16A61' : '1px solid #e2e8f0', fontSize:'11px', color: isReinvestActive ? '#000' : '#cbd5e0' }} 
                   />
                </td>

                <td style={{...tdStyle, borderLeft: '1px solid #f1f5f9'}}>
                   <input type="number" step="0.5" value={row.stopa} onChange={(e) => updateRow(row.id, 'stopa', e.target.value)} style={{ width: '35px', textAlign: 'center', border: 'none', background: 'transparent', borderBottom: '1px solid #cbd5e0', fontSize:'11px' }} />
                </td>
              </tr>
              {row.expanded && <MonthlyDetails yearData={row} prevCapitalIKE={prevCapitalIKE} prevCapitalIKZE={prevCapitalIKZE} />}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  </div>
);

// --- 4. PODSUMOWANIE ---
export const ProSummary = ({ final, totalDepositsIKE, totalDepositsIKZE }) => (
  <div style={{ marginTop: '40px' }}>
    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748', marginBottom: '20px' }}>💰 Twój Emerytalny Majątek</h3>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
      
      {/* BOX 1 */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
         <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#B2B2B2', fontWeight: '700' }}>Suma wpłat (IKE+IKZE)</div>
         <div style={{ fontSize: '26px', fontWeight: '800', color: '#2d3748', marginTop: '6px' }}>{f(final.totalPaid)} zł</div>
      </div>

      {/* BOX 2 */}
      <div style={{ background: 'rgba(0, 168, 187, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid #00A8BB' }}>
         <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#00A8BB', fontWeight: '700' }}>Konto IKE (Netto)</div>
         <div style={{ fontSize: '26px', fontWeight: '800', color: '#00A8BB', marginTop: '6px' }}>{f(final.endIKE)} zł</div>
         <div style={{ fontSize: '12px', color: '#00A8BB', marginTop: '6px', borderTop: '1px solid rgba(0,168,187,0.2)', paddingTop: '6px' }}>
           Wpłacono na IKE: <strong>{f(totalDepositsIKE)} zł</strong>
         </div>
      </div>

      {/* BOX 3 */}
      <div style={{ background: 'rgba(212, 160, 23, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid #D4A017' }}>
         <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#D4A017', fontWeight: '700' }}>Konto IKZE (Po podatku 10%)</div>
         <div style={{ fontSize: '26px', fontWeight: '800', color: '#D4A017', marginTop: '6px' }}>{f(final.endIKZE * 0.9)} zł</div>
         <div style={{ fontSize: '12px', color: '#D4A017', marginTop: '6px', borderTop: '1px solid rgba(212,160,23,0.2)', paddingTop: '6px' }}>
            Brutto: {f(final.endIKZE)} zł <br/>
            Wpłacono na IKZE: <strong>{f(totalDepositsIKZE)} zł</strong>
         </div>
      </div>

      {/* BOX 4 */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '2px solid #F16A61' }}>
         <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#F16A61', fontWeight: '700' }}>RAZEM (IKE + IKZE + Zwroty)</div>
         <div style={{ fontSize: '32px', fontWeight: '800', color: '#F16A61', marginTop: '6px' }}>{f( final.endIKE + (final.endIKZE * 0.9) + final.accTaxReturn )} zł</div>
         <div style={{ fontSize: '12px', color: '#F16A61', marginTop: '6px', lineHeight: '1.4', borderTop: '1px solid rgba(241,106,97,0.2)', paddingTop: '6px' }}>
           W tym zreinwestowane zwroty:<br/><strong>{f(final.accTaxReturn)} zł</strong>
         </div>
      </div>
    </div>

    {/* --- DISCLAIMERS --- */}
    <div style={{ marginTop: '60px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', color: '#B2B2B2', fontSize: '11px', lineHeight: '1.6' }}>
       <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#B2B2B2' }}>Zastrzeżenia prawne i metodologiczne:</p>
       <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0 }}>
         <li><strong>To nie jest porada inwestycyjna:</strong> Prezentowane informacje nie stanowią rekomendacji finansowej w rozumieniu przepisów prawa. Decyzje inwestycyjne podejmujesz na własne ryzyko.</li>
         <li><strong>Uproszczony model:</strong> Kalkulator zakłada roczną kapitalizację odsetek oraz pobieranie opłat/podatków w cyklach rocznych. W rzeczywistości banki mogą naliczać odsetki dziennie, a fundusze wyceniać jednostki w czasie rzeczywistym.</li>
         <li><strong>Przyszłość jest nieznana:</strong> Dla lat przyszłych przyjęto limity wpłat równe limitom z roku 2026. W rzeczywistości są one waloryzowane o wskaźnik średniego wynagrodzenia i mogą ulec zmianie.</li>
         <li><strong>Koszty wyjścia:</strong> Obliczenia zakładają dotrwanie do wieku emerytalnego (60/65 lat). Nie uwzględniono kosztów przedterminowego "zwrotu" środków, które wiążą się z koniecznością zapłaty podatku dochodowego (IKZE) lub podatku Belki (IKE).</li>
         <li><strong>Podatki:</strong> W kolumnie "Reinwestycja" zysk jest pomniejszany o 19% podatku od zysków kapitałowych. Główne konta IKE/IKZE rosną w symulacji bez podatku (przy założeniu spełnienia warunków ustawowych przy wypłacie).</li>
       </ul>
    </div>
  </div>
);