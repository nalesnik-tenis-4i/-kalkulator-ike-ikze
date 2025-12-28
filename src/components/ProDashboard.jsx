import React, { useState, useMemo } from 'react';
import { LIMITS } from '../data';
import { ProToolbar, ProTable, ProSummary } from './ProComponents';

export default function ProDashboard({ 
  currentAge = 30, 
  retirementAge = 65, 
  defaultTaxRate = 0.12, 
  defaultIsCompany = false,
  defaultStopa = 6 
}) {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - currentAge;

  const startRokSymulacji = 2021;
  const safeRetirementAge = Math.max(retirementAge, currentAge + 1);
  const endYear = birthYear + safeRetirementAge;

  // --- 1. STAN DANYCH ---
  const [rows, setRows] = useState(() => {
    let initRows = [];
    const finalYear = Math.max(startRokSymulacji + 1, endYear);

    for (let y = startRokSymulacji; y <= finalYear; y++) {
      const limitData = LIMITS[y] || LIMITS[2026] || {}; 
      const limitStandard = limitData.IKZE || 0;
      const limitCompany = limitData.IKZE_FIRMA || 0;
      const ageInYear = y - birthYear;

      initRows.push({
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
        expanded: false
      });
    }
    return initRows;
  });

  // --- 2. OBLICZENIA ---
  const calculation = useMemo(() => {
    let ikeCapital = 0;
    let ikzeCapital = 0;
    let accumulatedTaxReturn = 0; 
    let totalPaid = 0;
    
    const results = rows.map(row => {
      const effectiveLimitIKZE = (row.isCompany && row.rawLimitIKZE_Firma > 0) 
        ? row.rawLimitIKZE_Firma 
        : row.rawLimitIKZE;

      const interest = (row.stopa || 0) / 100;
      
      const profitIKE = ikeCapital * interest;
      ikeCapital += profitIKE + (row.wplataIKE || 0);

      const profitIKZE = ikzeCapital * interest;
      ikzeCapital += profitIKZE + (row.wplataIKZE || 0);

      const taxReturn = (row.wplataIKZE || 0) * (row.taxRate || 0.12);
      accumulatedTaxReturn = accumulatedTaxReturn * (1 + 0.04 * 0.81) + taxReturn;

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
    const totalDepositsIKE = results.reduce((acc, r) => acc + (r.wplataIKE || 0), 0);

    return { results, final, totalDepositsIKE };
  }, [rows]);

  // --- 3. AKCJE ---
  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (field === 'isCompany') return { ...r, isCompany: value };
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
      <ProToolbar fillMax={fillMax} clearAll={clearAll} />
      <ProTable results={calculation.results} updateRow={updateRow} toggleExpand={toggleExpand} />
      <ProSummary final={calculation.final} totalDepositsIKE={calculation.totalDepositsIKE} />
    </div>
  );
}