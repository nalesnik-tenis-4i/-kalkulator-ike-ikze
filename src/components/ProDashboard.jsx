import React, { useState, useMemo, useEffect } from 'react';
import { LIMITS } from '../data';
import { ProToolbar, ProTable, ProSummary } from './ProComponents'; // Upewnij się, że importujesz z nowego pliku

export default function ProDashboard({ 
  currentAge = 30, 
  retirementAge = 65, 
  defaultTaxRate = 0.12, 
  defaultIsCompany = false,
  defaultStopa = 6 
}) {
  
  const [localAge, setLocalAge] = useState(currentAge);
  const [localRetAge, setLocalRetAge] = useState(retirementAge);
  const [startYear, setStartYear] = useState(2021); 

  const [rows, setRows] = useState([]);

  // --- GENEROWANIE TABELI (po zmianie czasu) ---
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - localAge;
    
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
        rawLimitIKZE: limitStandard,
        rawLimitIKZE_Firma: limitCompany,
        limitIKE: limitData.IKE || 0,
        isCompany: defaultIsCompany,
        taxRate: defaultTaxRate,
        wplataIKE: 0,
        wplataIKZE: 0,
        stopa: defaultStopa,
        isReinvesting: false,
        reinvestRate: 4.0, 
        expanded: false
      });
    }
    setRows(newRows);
  }, [localAge, localRetAge, startYear, defaultIsCompany, defaultTaxRate, defaultStopa]);


  // --- OBLICZENIA ---
  const calculation = useMemo(() => {
    let ikeCapital = 0;
    let ikzeCapital = 0;
    let accumulatedTaxReturn = 0; 
    let totalPaid = 0;
    
    const results = rows.map(row => {
      const effectiveLimitIKZE = (row.isCompany && row.rawLimitIKZE_Firma > 0) ? row.rawLimitIKZE_Firma : row.rawLimitIKZE;
      const interest = (row.stopa || 0) / 100;
      
      const profitIKE = ikeCapital * interest;
      ikeCapital += profitIKE + (row.wplataIKE || 0);

      const profitIKZE = ikzeCapital * interest;
      ikzeCapital += profitIKZE + (row.wplataIKZE || 0);

      // Reinwestycja
      const taxReturn = (row.wplataIKZE || 0) * (row.taxRate || 0.12);
      const reinvestGrowth = (row.reinvestRate || 0) / 100;
      
      // Zysk z reinwestycji pomniejszony o Belkę (19%) -> mnożnik 0.81
      if (row.isReinvesting) {
        accumulatedTaxReturn = accumulatedTaxReturn * (1 + reinvestGrowth * 0.81) + taxReturn;
      } else {
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
    
    // Sumy wpłat
    const totalDepositsIKE = results.reduce((acc, r) => acc + (r.wplataIKE || 0), 0);
    const totalDepositsIKZE = results.reduce((acc, r) => acc + (r.wplataIKZE || 0), 0);

    return { results, final, totalDepositsIKE, totalDepositsIKZE };
  }, [rows]);

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
      <ProSummary 
        final={calculation.final} 
        totalDepositsIKE={calculation.totalDepositsIKE}
        totalDepositsIKZE={calculation.totalDepositsIKZE}
      />
    </div>
  );
}