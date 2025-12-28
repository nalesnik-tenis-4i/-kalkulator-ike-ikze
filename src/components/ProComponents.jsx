import React from 'react';

// Formatowanie waluty (bez groszy dla czytelności)
const f = (n) => n ? Math.round(n).toLocaleString('pl-PL') : '0';

// Style pomocnicze
const thStyle = { padding: '12px 8px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: '#4b5563', borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc', whiteSpace: 'nowrap' };
const tdStyle = { padding: '8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontSize: '12px', verticalAlign: 'middle' };
const inputClass = (val, limit) => val > limit ? "pro-table-input limit-warning" : "pro-table-input";

const toolbarInputStyle = { padding: '8px', border: '1px solid #cbd5e0', borderRadius: '6px', width: '80px', textAlign: 'center', fontWeight: 'bold' };
const toolbarLabelStyle = { fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '4px' };

// --- 1. TOOLBAR ---
export const ProToolbar = ({ 
  localAge, setLocalAge, 
  localRetAge, setLocalRetAge, 
  startYear, setStartYear,
  fillMax, clearAll 
}) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      
      {/* SEKCJA DANYCH OSOBOWYCH */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <div>
          <label style={toolbarLabelStyle}>Wiek (Start)</label>
          <input type="number" value={localAge} onChange={(e) => setLocalAge(Number(e.target.value))} style={toolbarInputStyle} />
        </div>
        <div>
          <label style={toolbarLabelStyle}>Wiek Emerytury</label>
          <input type="number" value={localRetAge} onChange={(e) => setLocalRetAge(Number(e.target.value))} style={toolbarInputStyle} />
        </div>
        <div>
          <label style={toolbarLabelStyle}>Rok Startu</label>
          <input type="number" value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} style={toolbarInputStyle} />
        </div>
      </div>

      {/* SEKCJA AKCJI */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={fillMax} style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '600', background: '#ebf8ff', color: '#2b6cb0', border: '1px solid #bee3f8', borderRadius: '8px', cursor: 'pointer' }}>
           Wypełnij MAX
        </button>
        <button onClick={clearAll} style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '600', background: '#fff', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer' }}>
           Wyczyść
        </button>
      </div>
    </div>
    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', fontStyle: 'italic' }}>
      * Zmiana wieku lub roku startu spowoduje zresetowanie tabeli do wartości domyślnych.
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
    <tr style={{ backgroundColor: '#f8fafc' }}>
      <td colSpan="100%" style={{ padding: '0' }}>
        <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
          <strong style={{ fontSize: '12px', color: '#4a5568', display: 'block', marginBottom: '10px' }}>
            📅 Symulacja miesięczna dla roku {yearData.rok} (Oprocentowanie: {stopa}%)
          </strong>
          <table style={{ width: '100%', minWidth: '600px', fontSize: '11px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #cbd5e0', color: '#718096' }}>
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
                  <tr key={m} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '4px' }}>{m}</td>
                    <td style={{ padding: '4px', textAlign: 'right', color: '#4299e1' }}>+{wplataIKE_mc.toFixed(0)}</td>
                    <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{f(tempIKE)}</td>
                    <td style={{ padding: '4px', textAlign: 'right', color: '#48bb78' }}>+{wplataIKZE_mc.toFixed(0)}</td>
                    <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{f(tempIKZE)}</td>
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
    <table style={{ width: '100%', minWidth: '1300px', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{...thStyle, textAlign: 'left', width: '30px'}}></th>
          <th style={{...thStyle, textAlign: 'left'}}>Rok (Wiek)</th>
          
          {/* USTAWIENIA */}
          <th style={{...thStyle, color: '#d97706', borderLeft: '1px solid #e2e8f0'}}>B2B?</th>
          <th style={{...thStyle, color: '#d97706'}}>Podatek</th>

          {/* IKE */}
          <th style={{...thStyle, color: '#2563eb', borderLeft: '1px solid #e2e8f0'}}>Limit IKE</th>
          <th style={{...thStyle, color: '#2563eb', width: '90px'}}>Wpłata IKE</th>
          <th style={{...thStyle, color: '#2563eb'}}>Kapitał IKE</th>

          {/* IKZE */}
          <th style={{...thStyle, color: '#16a34a', borderLeft: '1px solid #e2e8f0'}}>Limit IKZE</th>
          <th style={{...thStyle, color: '#16a34a', width: '90px'}}>Wpłata IKZE</th>
          <th style={{...thStyle, color: '#16a34a'}}>Kapitał IKZE</th>
          
          {/* REINWESTYCJA (Zmieniony tekst i szerokość) */}
          <th style={{...thStyle, color: '#805ad5', borderLeft: '1px solid #e2e8f0', textAlign: 'center', width: '140px'}}>
             Reinwestycja<br/>oszczędności z IKZE
          </th>
          <th style={{...thStyle, color: '#805ad5', width: '90px'}}>Kwota Zwrotu</th>
          <th style={{...thStyle, color: '#805ad5'}}>% Zysk</th>
          
          <th style={{...thStyle, borderLeft: '1px solid #e2e8f0'}}>Zysk Rynkowy</th>
        </tr>
      </thead>
      <tbody>
        {results.map((row, idx) => {
          const prevCapitalIKE = idx > 0 ? results[idx-1].endIKE : 0;
          const prevCapitalIKZE = idx > 0 ? results[idx-1].endIKZE : 0;
          
          return (
            <React.Fragment key={row.id}>
              <tr style={{ backgroundColor: row.id % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                <td style={tdStyle}>
                  <button onClick={() => toggleExpand(row.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#94a3b8' }}>
                    {row.expanded ? '▼' : '▶'}
                  </button>
                </td>
                <td style={{...tdStyle, textAlign: 'left', fontWeight: '600', color: '#334155'}}>
                  {row.rok} <span style={{ color: '#94a3b8', fontWeight: 'normal', fontSize: '10px' }}>({Math.floor(row.wiek)}l.)</span>
                </td>

                {/* B2B / Podatek */}
                <td style={{...tdStyle, borderLeft: '1px solid #f1f5f9', textAlign: 'center'}}>
                  <input type="checkbox" checked={row.isCompany} onChange={(e) => updateRow(row.id, 'isCompany', e.target.checked)} style={{ cursor: 'pointer' }} />
                </td>
                <td style={tdStyle}>
                  <input type="number" step="0.01" value={row.taxRate} onChange={(e) => updateRow(row.id, 'taxRate', e.target.value)} style={{ width: '35px', fontSize: '11px', border: 'none', borderBottom: '1px solid #cbd5e0', textAlign: 'right', background:'transparent' }} />
                </td>
                
                {/* IKE */}
                <td style={{...tdStyle, color: '#94a3b8', borderLeft: '1px solid #f1f5f9'}}>{f(row.limitIKE)}</td>
                <td style={tdStyle}>
                  <input type="number" value={row.wplataIKE === 0 ? '' : row.wplataIKE} placeholder="0" onChange={(e) => updateRow(row.id, 'wplataIKE', e.target.value)} className={inputClass(row.wplataIKE, row.limitIKE)} />
                  {row.wplataIKE > row.limitIKE && <div style={{fontSize:'9px', color: '#e53e3e'}}>Limit!</div>}
                </td>
                <td style={{...tdStyle, fontWeight: '700', color: '#2563eb'}}>{f(row.endIKE)}</td>

                {/* IKZE */}
                <td style={{...tdStyle, color: '#94a3b8', borderLeft: '1px solid #f1f5f9'}}>{f(row.effectiveLimitIKZE)}</td>
                <td style={tdStyle}>
                   <input type="number" value={row.wplataIKZE === 0 ? '' : row.wplataIKZE} placeholder="0" onChange={(e) => updateRow(row.id, 'wplataIKZE', e.target.value)} className={inputClass(row.wplataIKZE, row.effectiveLimitIKZE)} />
                </td>
                <td style={{...tdStyle, fontWeight: '700', color: '#16a34a'}}>{f(row.endIKZE)}</td>

                {/* REINWESTYCJA */}
                <td style={{...tdStyle, borderLeft: '1px solid #f1f5f9', textAlign: 'center', background: row.isReinvesting ? '#faf5ff' : 'transparent'}}>
                   <input type="checkbox" checked={row.isReinvesting} onChange={(e) => updateRow(row.id, 'isReinvesting', e.target.checked)} style={{ cursor: 'pointer', accentColor: '#805ad5' }} />
                </td>
                <td style={{...tdStyle, background: row.isReinvesting ? '#faf5ff' : 'transparent', color: row.isReinvesting ? '#553c9a' : '#cbd5e0' }}>
                   {f(row.wplataIKZE * row.taxRate)}
                </td>
                <td style={{...tdStyle, background: row.isReinvesting ? '#faf5ff' : 'transparent'}}>
                   <input 
                     type="number" step="0.5" 
                     value={row.reinvestRate} 
                     disabled={!row.isReinvesting}
                     onChange={(e) => updateRow(row.id, 'reinvestRate', e.target.value)} 
                     style={{ width: '35px', textAlign: 'center', border: 'none', background: 'transparent', borderBottom: row.isReinvesting ? '1px solid #9f7aea' : '1px solid #e2e8f0', fontSize:'11px', color: row.isReinvesting ? '#000' : '#cbd5e0' }} 
                   />
                </td>

                {/* STOPA RYNKOWA */}
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

// --- 4. PODSUMOWANIE (Ze Disclaimerami i sumami wpłat) ---
export const ProSummary = ({ final, totalDepositsIKE, totalDepositsIKZE }) => (
  <div style={{ marginTop: '40px' }}>
    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>💰 Twój Emerytalny Majątek</h3>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
      
      {/* BOX 1: WPŁACONO ŁĄCZNIE */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
         <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Suma wpłat (IKE+IKZE)</div>
         <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>{f(final.totalPaid)} zł</div>
      </div>

      {/* BOX 2: IKE */}
      <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '16px', border: '1px solid #dbeafe' }}>
         <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#2563eb', fontWeight: '700' }}>Konto IKE (Netto)</div>
         <div style={{ fontSize: '26px', fontWeight: '800', color: '#1e40af', marginTop: '6px' }}>{f(final.endIKE)} zł</div>
         <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>Wpłacono na IKE: {f(totalDepositsIKE)} zł</div>
      </div>

      {/* BOX 3: IKZE */}
      <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '16px', border: '1px solid #dcfce7' }}>
         <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#16a34a', fontWeight: '700' }}>Konto IKZE (Po podatku 10%)</div>
         <div style={{ fontSize: '26px', fontWeight: '800', color: '#166534', marginTop: '6px' }}>{f(final.endIKZE * 0.9)} zł</div>
         <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '4px' }}>
            Brutto: {f(final.endIKZE)} zł <br/>
            Wpłacono na IKZE: {f(totalDepositsIKZE)} zł
         </div>
      </div>

      {/* BOX 4: RAZEM + ZWROTY */}
      <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '16px', border: '2px solid #fdba74' }}>
         <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#ea580c', fontWeight: '700' }}>RAZEM (IKE + IKZE + Zwroty)</div>
         <div style={{ fontSize: '32px', fontWeight: '800', color: '#9a3412', marginTop: '6px' }}>{f( final.endIKE + (final.endIKZE * 0.9) + final.accTaxReturn )} zł</div>
         <div style={{ fontSize: '12px', color: '#c2410c', marginTop: '4px', lineHeight: '1.4' }}>
           W tym zreinwestowane zwroty:<br/><strong>{f(final.accTaxReturn)} zł</strong>
         </div>
      </div>
    </div>

    {/* SEKCJA ZASTRZEŻEŃ (DISCLAIMERS) */}
    <div style={{ marginTop: '50px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', color: '#94a3b8', fontSize: '11px', lineHeight: '1.6' }}>
       <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Zastrzeżenia prawne:</p>
       <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0 }}>
         <li>Kalkulator jest narzędziem poglądowym. Rzeczywiste wyniki inwestycji mogą się różnić w zależności od sytuacji rynkowej, inflacji i zmian prawnych.</li>
         <li>Dla lat przyszłych przyjęto założenie, że limity wpłat będą równe najwyższym obecnie ogłoszonym lub szacowanym limitom. W rzeczywistości limity te zmieniają się co roku.</li>
         <li>Obliczenia nie uwzględniają kosztów przedterminowego zakończenia oszczędzania (tzw. "zwrotu" w rozumieniu ustawy), opłat likwidacyjnych ani prowizji maklerskich (chyba że uwzględniono je w stopie zwrotu).</li>
         <li>Reinwestycja zwrotu podatku uwzględnia podatek od zysków kapitałowych (Podatek Belki 19%), natomiast zyski wewnątrz IKE/IKZE są prezentowane jako zwolnione z tego podatku (przy spełnieniu warunków wypłaty).</li>
         <li>Prezentowane informacje nie stanowią porady inwestycyjnej ani rekomendacji w rozumieniu przepisów prawa.</li>
       </ul>
    </div>
  </div>
);