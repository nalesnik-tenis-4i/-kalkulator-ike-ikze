import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SummaryResults } from './CalculatorComponents';

export default function ResultsSection({ chartData, final, labelWplaty, reinwestuj }) {
  
  const chartContainerStyle = { 
    marginBottom: '10px', 
    height: '350px',
    width: '100%'
  };

  return (
    <div>
      {/* --- WYKRES --- */}
      <div style={chartContainerStyle}>
         <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#B2B2B2', letterSpacing: '1px', marginBottom: '10px' }}>
            Projekcja kapitału
         </h4>
         <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="wiek" fontSize={11} stroke="#B2B2B2" tickMargin={10} />
              <YAxis fontSize={11} stroke="#B2B2B2" tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(val) => Math.round(val).toLocaleString() + ' zł'} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend verticalAlign="top" height={50} iconType="circle" wrapperStyle={{ paddingBottom: '10px' }} />
              
              {/* LINIA WPŁAT - SZARY */}
              <Line name={labelWplaty} type="stepAfter" dataKey="SumaWplat" stroke="#B2B2B2" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              
              {/* IKE - TURKUS */}
              <Line name="IKE (Netto)" type="monotone" dataKey="IKE" stroke="#00A8BB" dot={false} strokeWidth={3} activeDot={{ r: 6 }} />
              
              {/* IKZE - ZŁOTO */}
              <Line name="IKZE + Zwroty (Netto)" type="monotone" dataKey="IKZE" stroke="#D4A017" dot={false} strokeWidth={3} activeDot={{ r: 6 }} />
            </LineChart>
         </ResponsiveContainer>
      </div>

      {/* --- PASTYLKA WPŁACONO --- */}
      <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '40px' }}>
         <div style={{ 
           display: 'inline-block', 
           background: '#fff', 
           color: '#B2B2B2', 
           padding: '8px 24px', 
           borderRadius: '50px', 
           fontWeight: 'bold', 
           fontSize: '14px',
           border: '1px solid #e2e8f0',
           boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
         }}>
            💰 Wpłacono łącznie: {final.SumaWplat.toLocaleString()} zł
         </div>
      </div>

      {/* --- KAFELKI WYNIKÓW --- */}
      <SummaryResults final={final} reinwestuj={reinwestuj} />
    </div>
  );
}