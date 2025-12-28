import React, { useState, useEffect, useMemo } from 'react';
import { LIMITS } from '../data'; // Importujemy historyczne limity

// --- KOMPONENT POMOCNICZY: Podgląd miesięczny (rozwijany) ---
const MonthlyDetails = ({ yearData, prevCapitalIKE, prevCapitalIKZE }) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const rMies = (yearData.stopa / 100) / 12;
  
  // Rozkładamy wpłatę równomiernie (uproszczenie dla podglądu, w silniku rocznym jest prościej)
  // W wersji super-pro można by tu dać edycję każdego miesiąca, ale na razie symulacja:
  const wplataIKE_mc = yearData.wplataIKE / 12;
  const wplataIKZE_mc = yearData.wplataIKZE / 12;

  let tempIKE = prevCapitalIKE;
  let tempIKZE = prevCapitalIKZE;

  return (
    <tr style={{ backgroundColor: '#f8fafc' }}>
      <td colSpan="100%" style={{ padding: '0' }}>
        <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0' }}>
          <strong style={{ fontSize: '12px', color: '#4a5568', display: 'block', marginBottom: '10px' }}>
            📅 Symulacja miesięczna dla roku {yearData.rok} (Oprocentowanie: {yearData.stopa}%)
          </strong>
          <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
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
                // Kapitalizacja
                tempIKE = tempIKE * (1 + rMies) + wplataIKE_mc;
                tempIKZE = tempIKZE * (1 + rMies) + wplataIKZE_mc;
                
                return (
                  <tr key={m} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '4px' }}>{m}</td>
                    <td style={{ padding: '4px', textAlign: 'right', color: '#4299e1' }}>+{wplataIKE_mc.toFixed(0)}</td>
                    <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{tempIKE.toLocaleString('pl-PL', {maximumFractionDigits:0})}</td>
                    <td style={{ padding: '4px', textAlign: 'right', color: '#48bb78' }}>+{wplataIKZE_mc.toFixed(0)}</td>
                    <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{tempIKZE.toLocaleString('pl-PL', {maximumFractionDigits:0})}</td>
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

// --- GŁÓWNY KOMPONENT ---
export default function ProDashboard({ startWiek, startWiekEmerytura, taxRate, defaultStopa }) {
  
  // 1. Inicjalizacja stanu wierszy (Lata)
  // Tworzymy historię np. od 2020 roku (lub wcześniej, jeśli użytkownik zmieni) do emerytury
  const currentYear = new Date().getFullYear();
  const startYear = 2022; // Domyślnie startujemy trochę w przeszłości, żeby pokazać funkcję
  const endYear = currentYear + (startWiekEmerytura - startWiek);

  const [rows, setRows] = useState(() => {
    let initRows = [];
    let ageCounter = startWiek - (currentYear - startYear);

    for (let y = startYear; y <= endYear; y++) {
      const limitY = LIMITS[y] || LIMITS[2026] || {}; // Fallback dla przyszłości
      initRows.push({
        id: y,
        rok: y,
        wiek: ageCounter++,
        limitIKE: limitY.IKE || 0,
        limitIKZE: limitY.IKZE || 0, // Domyślnie zwykłe IKZE, można dodać toggle dla firmy
        wplataIKE: 0,
        wplataIKZE: 0,
        stopa: defaultStopa,
        expanded: false
      });
    }
    return initRows;
  });

  // 2. Silnik obliczeniowy (Memoized)
  const calculation = useMemo(() => {
    let ikeCapital = 0;
    let ikzeCapital = 0;
    let accumulatedTaxReturn = 0; // Zwroty podatku z IKZE (jeśli reinwestowane)
    let totalPaid = 0;
    
    // Zakładamy reinwestycję zwrotu na osobnym koncie opodatkowanym Belką (uproszczenie)
    // lub doliczanie do IKZE jeśli mieści się w limicie? 
    // W tym modelu PRO przyjmijmy, że zwrot podatku to "Ekstra Zysk" (cash in hand) 
    // albo reinwestycja na koncie oszczędnościowym.
    // Dla uproszczenia tabeli: pokazujemy wartość IKZE + Wartość Ulg (jako osobna kolumna lub zsumowana).
    
    const results = rows.map(row => {
      // 1. Zysk roczny od kapitału z początku roku
      const interest = row.stopa / 100;
      
      // IKE
      const profitIKE = ikeCapital * interest;
      ikeCapital += profitIKE + row.wplataIKE;

      // IKZE
      const profitIKZE = ikzeCapital * interest;
      ikzeCapital += profitIKZE + row.wplataIKZE;

      // Ulga podatkowa w tym roku
      const taxReturn = row.wplataIKZE * taxRate; 
      // Załóżmy, że ulga też pracuje na 4% (konto oszczędnościowe) minus Belka
      accumulatedTaxReturn = accumulatedTaxReturn * (1 + 0.04 * 0.81) + taxReturn;

      totalPaid += (row.wplataIKE + row.wplataIKZE);

      return {
        ...row,
        endIKE: ikeCapital,
        endIKZE: ikzeCapital, // To jest wartość brutto na koncie IKZE
        taxReturnYear: taxReturn,
        accTaxReturn: accumulatedTaxReturn,
        totalPaid
      };
    });

    return { results, final: results[results.length - 1] };
  }, [rows, taxRate]);

  // Handlery
  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      return { ...r, [field]: Number(value) };
    }));
  };

  const toggleExpand = (id) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, expanded: !r.expanded } : r));
  };

  // Masowe uzupełnianie (Helper)
  const fillMax = () => {
    setRows(prev => prev.map(r => ({
      ...r,
      wplataIKE: r.limitIKE,
      wplataIKZE: r.limitIKZE
    })));
  };

  const clearAll = () => {
    setRows(prev => prev.map(r => ({ ...r, wplataIKE: 0, wplataIKZE: 0 })));
  };

  // --- STYLING ---
  const inputClass = (val, limit) => {
    const base = "pro-table-input";
    if (val > limit) return `${base} limit-warning`;
    return base;
  };

  const thStyle = { padding: '12px 8px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#4b5563', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' };
  const tdStyle = { padding: '8px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontSize: '13px' };

  return (
    <div style={{ paddingBottom: '60px' }}>
      
      {/* TOOLBAR */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Arkusz szczegółowy</h2>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Edytuj wpłaty dla każdego roku. System sprawdzi limity historyczne.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fillMax} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '500', background: '#ebf8ff', color: '#2b6cb0', border: '1px solid #bee3f8', borderRadius: '6px', cursor: 'pointer' }}>
             Wypełnij MAX
          </button>
          <button onClick={clearAll} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '500', background: '#fff', color: '#e53e3e', border: '1px solid #fed7d7', borderRadius: '6px', cursor: 'pointer' }}>
             Wyczyść
          </button>
        </div>
      </div>

      {/* TABELA GŁÓWNA */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{...thStyle, textAlign: 'left', width: '40px'}}></th>
              <th style={{...thStyle, textAlign: 'left'}}>Rok (Wiek)</th>
              <th style={{...thStyle, color: '#3182ce'}}>Limit IKE</th>
              <th style={{...thStyle, color: '#3182ce', width: '120px'}}>Twój Wkład IKE</th>
              <th style={{...thStyle, color: '#3182ce'}}>IKE Kapitał</th>
              <th style={{...thStyle, borderLeft: '1px solid #e2e8f0', color: '#2f855a'}}>Limit IKZE</th>
              <th style={{...thStyle, color: '#2f855a', width: '120px'}}>Twój Wkład IKZE</th>
              <th style={{...thStyle, color: '#2f855a'}}>Zwrot z PIT</th>
              <th style={{...thStyle, color: '#2f855a'}}>IKZE Kapitał</th>
              <th style={{...thStyle, borderLeft: '1px solid #e2e8f0'}}>Zysk %</th>
            </tr>
          </thead>
          <tbody>
            {calculation.results.map((row, idx) => {
              const prevCapitalIKE = idx > 0 ? calculation.results[idx-1].endIKE : 0;
              const prevCapitalIKZE = idx > 0 ? calculation.results[idx-1].endIKZE : 0;

              return (
                <React.Fragment key={row.id}>
                  <tr style={{ backgroundColor: row.id % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                    <td style={tdStyle}>
                      <button 
                        onClick={() => toggleExpand(row.id)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#718096' }}
                      >
                        {row.expanded ? '▼' : '▶'}
                      </button>
                    </td>
                    <td style={{...tdStyle, textAlign: 'left', fontWeight: '600', color: '#2d3748'}}>
                      {row.rok} <span style={{ color: '#a0aec0', fontWeight: 'normal', fontSize: '11px' }}>({row.wiek}l.)</span>
                    </td>
                    
                    {/* SEKCJA IKE */}
                    <td style={{...tdStyle, color: '#a0aec0'}}>{row.limitIKE.toLocaleString()}</td>
                    <td style={tdStyle}>
                      <input 
                        type="number" 
                        value={row.wplataIKE} 
                        onChange={(e) => updateRow(row.id, 'wplataIKE', e.target.value)}
                        className={inputClass(row.wplataIKE, row.limitIKE)}
                      />
                      {row.wplataIKE > row.limitIKE && <div style={{fontSize:'10px', color: '#e53e3e'}}>Przekroczono limit!</div>}
                    </td>
                    <td style={{...tdStyle, fontWeight: 'bold', color: '#2b6cb0'}}>
                      {Math.round(row.endIKE).toLocaleString()}
                    </td>

                    {/* SEKCJA IKZE */}
                    <td style={{...tdStyle, borderLeft: '1px solid #f1f5f9', color: '#a0aec0'}}>{row.limitIKZE.toLocaleString()}</td>
                    <td style={tdStyle}>
                       <input 
                        type="number" 
                        value={row.wplataIKZE} 
                        onChange={(e) => updateRow(row.id, 'wplataIKZE', e.target.value)}
                        className={inputClass(row.wplataIKZE, row.limitIKZE)}
                      />
                    </td>
                    <td style={{...tdStyle, color: '#38a169', fontSize: '12px'}}>
                       +{Math.round(row.taxReturnYear).toLocaleString()}
                    </td>
                    <td style={{...tdStyle, fontWeight: 'bold', color: '#2f855a'}}>
                      {Math.round(row.endIKZE).toLocaleString()}
                    </td>

                    {/* STOPA */}
                    <td style={{...tdStyle, borderLeft: '1px solid #f1f5f9'}}>
                       <input 
                        type="number"
                        step="0.1"
                        value={row.stopa}
                        onChange={(e) => updateRow(row.id, 'stopa', e.target.value)}
                        style={{ width: '50px', textAlign: 'center', border: 'none', background: 'transparent', borderBottom: '1px solid #cbd5e0' }}
                       />
                    </td>
                  </tr>
                  
                  {/* EXPANDED ROW */}
                  {row.expanded && (
                    <MonthlyDetails 
                      yearData={row} 
                      prevCapitalIKE={prevCapitalIKE} 
                      prevCapitalIKZE={prevCapitalIKZE} 
                    />
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* WYNIKI NA SAMYM DOLE (Fixed bottom bar or just bottom section) */}
      <div style={{ marginTop: '40px' }}>
         <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748', marginBottom: '20px' }}>🏁 Podsumowanie symulacji</h3>
         
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {/* BOX 1 */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#718096', fontWeight: 'bold' }}>Wpłacono łącznie</div>
               <div style={{ fontSize: '24px', fontWeight: '800', color: '#2d3748', marginTop: '5px' }}>
                 {calculation.final.totalPaid.toLocaleString()} zł
               </div>
            </div>

            {/* BOX 2 */}
            <div style={{ background: '#ebf8ff', padding: '20px', borderRadius: '12px', border: '1px solid #bee3f8' }}>
               <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#2b6cb0', fontWeight: 'bold' }}>IKE (Netto)</div>
               <div style={{ fontSize: '24px', fontWeight: '800', color: '#2c5282', marginTop: '5px' }}>
                 {Math.round(calculation.final.endIKE).toLocaleString()} zł
               </div>
               <div style={{ fontSize: '12px', color: '#3182ce', marginTop: '5px' }}>
                 Zysk: {(calculation.final.endIKE - calculation.results.reduce((acc,r) => acc + r.wplataIKE, 0)).toLocaleString()} zł
               </div>
            </div>

            {/* BOX 3 */}
            <div style={{ background: '#f0fff4', padding: '20px', borderRadius: '12px', border: '1px solid #c6f6d5' }}>
               <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#2f855a', fontWeight: 'bold' }}>IKZE (Netto + Ulgi)</div>
               <div style={{ fontSize: '24px', fontWeight: '800', color: '#276749', marginTop: '5px' }}>
                 {/* IKZE minus 10% ryczałtu + zgromadzone ulgi (accTaxReturn) */}
                 {Math.round((calculation.final.endIKZE * 0.9) + calculation.final.accTaxReturn).toLocaleString()} zł
               </div>
               <div style={{ fontSize: '11px', color: '#38a169', marginTop: '5px', lineHeight: '1.4' }}>
                 Saldo konta: {Math.round(calculation.final.endIKZE).toLocaleString()} <br/>
                 + Odłożone ulgi: {Math.round(calculation.final.accTaxReturn).toLocaleString()}
               </div>
            </div>

            {/* BOX 4 */}
            <div style={{ background: '#fffaf0', padding: '20px', borderRadius: '12px', border: '1px solid #fbd38d' }}>
               <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#c05621', fontWeight: 'bold' }}>Różnica</div>
               <div style={{ fontSize: '24px', fontWeight: '800', color: '#dd6b20', marginTop: '5px' }}>
                  {Math.round(((calculation.final.endIKZE * 0.9) + calculation.final.accTaxReturn) - calculation.final.endIKE).toLocaleString()} zł
               </div>
               <div style={{ fontSize: '12px', color: '#c05621', marginTop: '5px' }}>
                 dla IKZE
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}