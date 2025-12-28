import React, { useState, useMemo, useEffect } from 'react';
import { LIMITS } from '../data';
import { ProToolbar, ProTable, ProSummary } from './ProComponents';

export default function ProDashboard({ 
  currentAge = 30, 
  retirementAge = 65, 
  defaultTaxRate = 0.12, 
  defaultIsCompany = false,
  defaultStopa = 6 
}) {
  
  // --- 1. LOKALNY STAN KONFIGURACJI ---
  // Umożliwiamy edycję wieku/dat bez wychodzenia z trybu PRO
  const [localAge, setLocalAge] = useState(currentAge);
  const [localRetAge, setLocalRetAge] = useState(retirementAge);
  const [startYear, setStartYear] = useState(2021); // Domyślnie startujemy trochę w przeszłości

  const [rows, setRows] = useState([]);

  // --- 2. GENERATOR TABELI ---
  // Uruchamiamy go, gdy zmienią się kluczowe parametry czasu (wiek, rok startu)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    // Obliczamy rok urodzenia na podstawie AKTUALNEGO wieku i roku kalendarzowego
    // (zakładamy że currentAge dotyczy roku currentYear)
    const birthYear = currentYear - localAge;
    
    // Zabezpieczenie logiczne
    const safeRetirementAge = Math.max(localRetAge, localAge + 1);
    const endYear = birthYear + safeRetirementAge;
    const finalYear = Math.max(startYear + 1, endYear);

    let newRows = [];
    
    for (let y = startYear; y <= finalYear; y++) {
      const limitData = LIMITS[y] || LIMITS[2026] || {}; 
      const limitStandard = limitData.IKZE || 0;
      const limitCompany = limitData.IKZE_FIRMA || 0;
      const ageInYear = y - birthYear;

      newRows.push({
        id: y,
        rok: y,
        wiek: ageInYear,
        
        // Limity
        rawLimitIKZE: limitStandard,
        rawLimitIKZE_Firma: limitCompany,
        limitIKE: limitData.IKE || 0,
        
        // Ustawienia użytkownika
        isCompany: defaultIsCompany,
        taxRate: defaultTaxRate,
        wplataIKE: 0,
        wplataIKZE: 0,
        stopa: defaultStopa,
        
        // Reinwestycja (Nowe pola)
        isReinvesting: false,
        reinvestRate: 4.0, // Domyślnie np. 4% (konto oszczędnościowe)

        expanded: false
      });
    }
    setRows(newRows);
  }, [localAge, localRetAge, startYear, defaultIsCompany, defaultTaxRate, defaultStopa]);


  // --- 3. OBLICZENIA ---
  const calculation = useMemo(() => {
    let ikeCapital = 0;
    let ikzeCapital = 0;
    let accumulatedTaxReturn = 0; // Pula reinwestowanych zwrotów
    let totalPaid = 0;
    
    const results = rows.map(row => {
      // Limit IKZE (B2B vs Etat)
      const effectiveLimitIKZE = (row.isCompany && row.rawLimitIKZE_Firma > 0) 
        ? row.rawLimitIKZE_Firma 
        : row.rawLimitIKZE;

      // Zysk rynkowy dla głównych kont
      const interest = (row.stopa || 0) / 100;
      
      const profitIKE = ikeCapital * interest;
      ikeCapital += profitIKE + (row.wplataIKE || 0);

      const profitIKZE = ikzeCapital * interest;
      ikzeCapital += profitIKZE + (row.wplataIKZE || 0);

      // --- LOGIKA REINWESTYCJI ---
      // 1. Obliczamy zwrot za ten rok
      const taxReturn = (row.wplataIKZE || 0) * (row.taxRate || 0.12);
      
      // 2. Jeśli reinwestujemy, dodajemy do puli. Jeśli nie - zwrot przepada (jest "konsumowany")
      if (row.isReinvesting) {
        // Pula rośnie o odsetki zdefiniowane w TYM WIERSZU (minus Belka)
        const reinvestGrowth = (row.reinvestRate || 0) / 100;
        accumulatedTaxReturn = accumulatedTaxReturn * (1 + reinvestGrowth * 0.81) + taxReturn;
      } else {
        // Pula rośnie tylko o odsetki (jeśli coś tam już było), ale nie dodajemy nowego zwrotu
        // Zakładamy, że stara pula ma "średnie" oprocentowanie z tego wiersza
        const reinvestGrowth = (row.reinvestRate || 0) / 100;
        accumulatedTaxReturn = accumulatedTaxReturn * (1 + reinvestGrowth * 0.81);
      }

      totalPaid += ((row.wplataIKE || 0) + (row.wplataIKZE || 0));

      return {
        ...row,
        effectiveLimitIKZE,
        endIKE: ikeCapital,
        endIKZE: ikzeCapital,
        taxReturnYear: taxReturn,
        accTaxReturn: accumulatedTaxReturn,
        totalPaid
      };
    });

    const defaultFinal = { totalPaid: 0, endIKE: 0, endIKZE: 0, accTaxReturn: 0 };
    const final = results.length > 0 ? results[results.length - 1] : defaultFinal;

    return { results, final };
  }, [rows]);

  // --- 4. AKCJE ---
  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (field === 'isCompany' || field === 'isReinvesting') return { ...r, [field]: value };
      return { ...r, [field]: Number(value) };
    }));
  };

  const toggleExpand = (id) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, expanded: !r.expanded } : r));
  };

  const fillMax = () => {
    setRows(prev => prev.map(r => {
       const limitIKZE = (r.isCompany && r.rawLimitIKZE_Firma > 0) ? r.rawLimitIKZE_Firma : r.rawLimitIKZE;
       return { ...r, wplataIKE: r.limitIKE, wplataIKZE: limitIKZE };
    }));
  };

  const clearAll = () => {
    setRows(prev => prev.map(r => ({ ...r, wplataIKE: 0, wplataIKZE: 0 })));
  };

  return (
    <div style={{ paddingBottom: '60px', width: '100%' }}>
      <ProToolbar 
        localAge={localAge} setLocalAge={setLocalAge}
        localRetAge={localRetAge} setLocalRetAge={setLocalRetAge}
        startYear={startYear} setStartYear={setStartYear}
        fillMax={fillMax} clearAll={clearAll} 
      />
      <ProTable results={calculation.results} updateRow={updateRow} toggleExpand={toggleExpand} />
      <ProSummary final={calculation.final} />
    </div>
  );
}