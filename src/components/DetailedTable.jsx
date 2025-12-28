import React from 'react';

export default function DetailedTable({ chartData }) {
  if (!chartData || chartData.length === 0) return null;

  return (
    <div style={{ marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
      <h4 style={{ color: '#2d3748', marginBottom: '15px' }}>📊 Szczegółowa analiza rok po roku</h4>
      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'right' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#f7fafc', zIndex: 1 }}>
            <tr>
              <th style={thStyle}>Wiek</th>
              <th style={thStyle}>Wpłacono</th>
              <th style={{...thStyle, color: '#3182ce'}}>IKE (Netto)</th>
              <th style={{...thStyle, color: '#2f855a'}}>IKZE (Netto)</th>
              <th style={thStyle}>Różnica</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr key={row.wiek} style={{ borderBottom: '1px solid #edf2f7' }}>
                <td style={tdStyle}>{row.wiek}</td>
                <td style={tdStyle}>{row.SumaWplat.toLocaleString()}</td>
                <td style={{...tdStyle, fontWeight: 'bold', color: '#2c5282'}}>{row.IKE.toLocaleString()}</td>
                <td style={{...tdStyle, fontWeight: 'bold', color: '#276749'}}>{row.IKZE.toLocaleString()}</td>
                <td style={{...tdStyle, color: (row.IKZE - row.IKE) > 0 ? '#38a169' : '#3182ce'}}>
                  {(row.IKZE - row.IKE).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = { padding: '12px 15px', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' };
const tdStyle = { padding: '10px 15px', color: '#2d3748' };