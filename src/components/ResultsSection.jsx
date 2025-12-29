import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SummaryResults } from './CalculatorComponents';

export default function ResultsSection({ chartData, final, labelWplaty, reinwestuj }) {
  
  const chartContainerStyle = { 
    marginBottom: '10px', 
    height: '350px',
    width: '100%'
  };

  // Formatowanie waluty z groszami (zawsze 2 miejsca po przecinku)
  const fmt = (val) => val.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';

  // Formatowanie osi Y (skrócone)
  const yAxisTickFormatter = (val) => {
    if (val >= 1000000) return `${(val/1000000).toFixed(1)}m`;
    if (val >= 1000) return `${(val/1000).toFixed(0)}k`;
    return val;
  };

  return (
    <div>
      {/* --- WYKRES --- */}
      <div style={chartContainerStyle}>
         <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#B2B2B2', letterSpacing: '1px', marginBottom: '10px' }}>
            Projekcja kapitału (Aktualizacja miesięczna)
         </h4>
         <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              
              {/* Oś X używa dokładnego wieku (float), ale pokazuje etykiety tylko dla pełnych lat */}
              <XAxis 
                dataKey="wiekRaw" 
                type="number"
                domain={['dataMin', 'dataMax']} 
                tickCount={Math.min(chartData.length / 12, 10)} // Ograniczamy ilość etykiet
                tickFormatter={(val) => Math.floor(val)} 
                fontSize={11} 
                stroke="#B2B2B2" 
                tickMargin={10} 
                allowDecimals={false}
              />
              
              <YAxis fontSize={11} stroke="#B2B2B2" tickFormatter={yAxisTickFormatter} width={40} />
              
              <Tooltip 
                formatter={(val) => fmt(val)} 
                labelFormatter={(label) => `Wiek: ${Math.floor(label)} lat`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend verticalAlign="top" height={50} iconType="circle" wrapperStyle={{ paddingBottom: '10px' }} />
              
              {/* Suma Wpłat - teraz pokaże schodki idealnie w momencie wpłaty */}
              <Line 
                name={labelWplaty} 
                type="stepAfter" // stepAfter jest ok, bo mamy gęste dane miesięczne
                dataKey="SumaWplat" 
                stroke="#B2B2B2" 
                strokeWidth={2} 
                dot={false} 
                strokeDasharray="4 4" 
                isAnimationActive={false} // Wyłącz animację dla lepszej wydajności przy dużej ilości punktów
              />
              
              <Line name="IKE (Netto)" type="monotone" dataKey="IKE" stroke="#00A8BB" dot={false} strokeWidth={3} isAnimationActive={false} />
              <Line name="IKZE + Zwroty (Netto)" type="monotone" dataKey="IKZE" stroke="#D4A017" dot={false} strokeWidth={3} isAnimationActive={false} />
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
            💰 Wpłacono łącznie: {fmt(final.SumaWplat)}
         </div>
      </div>

      {/* --- KAFELKI WYNIKÓW --- */}
      <SummaryResults final={final} reinwestuj={reinwestuj} fmt={fmt} />
    </div>
  );
}