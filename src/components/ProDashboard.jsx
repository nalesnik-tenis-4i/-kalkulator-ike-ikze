import React from 'react';

export default function ProDashboard() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      backgroundColor: '#fff', 
      borderRadius: '20px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ fontSize: '40px', marginBottom: '20px' }}>🚀</div>
      <h2 style={{ color: '#2d3748', marginBottom: '10px' }}>Panel PRO w przygotowaniu</h2>
      <p style={{ color: '#718096', maxWidth: '400px', lineHeight: '1.6' }}>
        Tutaj znajdzie się szczegółowa tabela rok-po-roku, zaawansowane wykresy porównawcze i możliwość eksportu danych.
      </p>
      <div style={{ marginTop: '30px', padding: '10px 20px', background: '#ebf8ff', color: '#3182ce', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
        Dostępne tylko na Desktop
      </div>
    </div>
  );
}