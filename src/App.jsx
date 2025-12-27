import { useState, useEffect } from 'react';
import { calculateIkzeBonus, taxes, CONSTANTS } from './calculations';
import InfoPage from './components/InfoPage';

function App() {
  const [activeTab, setActiveTab] = useState('kalkulator');
  const [rok, setRok] = useState(2025);
  const [czyFirma, setCzyFirma] = useState(false);
  const [wplata, setWplata] = useState(10407.60);
  const [podatek, setPodatek] = useState(0.12);

  const limit = czyFirma ? CONSTANTS[rok].IKZE_FIRMA : CONSTANTS[rok].IKZE;

  // MONITOR LIMITÓW I PODATKÓW
  useEffect(() => {
    // 1. Pilnowanie, aby wpłata nie przekroczyła nowego limitu po zmianie typu konta/roku
    if (wplata > limit) {
      setWplata(limit);
    }

    // 2. Pilnowanie poprawności podatku
    const dostepnePodatki = czyFirma ? taxes.b2b : taxes.etat;
    if (!dostepnePodatki.find(t => t.value === podatek)) {
      setPodatek(0.12);
    }
  }, [czyFirma, rok, limit]); // Wykonaj zawsze, gdy zmieni się typ, rok lub wyliczony limit

  const handleWplataChange = (val) => {
    if (val > limit) setWplata(limit);
    else if (val < 0) setWplata(0);
    else setWplata(val);
  };

  const korzyscIKZE = calculateIkzeBonus(wplata, podatek, rok, czyFirma);

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', fontFamily: 'sans-serif', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
        <button onClick={() => setActiveTab('kalkulator')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'kalkulator' ? '#fff' : 'transparent', fontWeight: 'bold', color: activeTab === 'kalkulator' ? '#3182ce' : '#718096', borderBottom: activeTab === 'kalkulator' ? '3px solid #3182ce' : 'none', cursor: 'pointer' }}>Kalkulator</button>
        <button onClick={() => setActiveTab('info')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'info' ? '#fff' : 'transparent', fontWeight: 'bold', color: activeTab === 'info' ? '#3182ce' : '#718096', borderBottom: activeTab === 'info' ? '3px solid #3182ce' : 'none', cursor: 'pointer' }}>Informacje</button>
      </div>

      <div style={{ padding: '20px' }}>
        {activeTab === 'kalkulator' ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Typ konta i rok:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={czyFirma} onChange={(e) => setCzyFirma(e.target.value === 'true')} style={{ flex: 1, padding: '10px', borderRadius: '6px' }}>
                  <option value="false">Osoba fizyczna</option>
                  <option value="true">Przedsiębiorca</option>
                </select>
                <select value={rok} onChange={(e) => setRok(Number(e.target.value))} style={{ flex: 1, padding: '10px', borderRadius: '6px' }}>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Planowana wpłata:</label>
              <input 
                type="number" 
                step="0.01"
                value={wplata} 
                onChange={(e) => handleWplataChange(Number(e.target.value))}
                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', fontSize: '18px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
              />
              <input 
                type="range"
                min="0"
                max={limit}
                step="0.01"
                value={wplata}
                onChange={(e) => setWplata(Number(e.target.value))}
                style={{ width: '100%', marginTop: '15px' }}
              />
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#a0aec0', marginTop: '5px' }}>
                Maksymalny limit: <strong>{limit.toLocaleString('pl-PL')} zł</strong>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Twój podatek:</label>
              <select value={podatek} onChange={(e) => setPodatek(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '6px' }}>
                {(czyFirma ? taxes.b2b : taxes.etat).map(t => <option key={t.label} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div style={{ background: '#f0fff4', padding: '25px', borderRadius: '12px', textAlign: 'center', border: '1px solid #c6f6d5' }}>
              <p style={{ margin: 0, color: '#2f855a', fontSize: '14px' }}>Szacowany zwrot podatku (ulga):</p>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#276749', marginTop: '5px' }}>
                {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(korzyscIKZE)}
              </div>
            </div>
          </div>
        ) : <InfoPage />}
      </div>
    </div>
  );
}

export default App;