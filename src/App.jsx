import { useState, useEffect } from 'react';
import { calculateIkzeBonus, taxes, CONSTANTS } from './calculations';
import InfoPage from './components/InfoPage';

function App() {
  const [activeTab, setActiveTab] = useState('kalkulator');
  
  // Parametry wejściowe (zgodnie z arkuszem KALKULATOR)
  const [rok, setRok] = useState(2025);
  const [czyFirma, setCzyFirma] = useState(false);
  const [wiek, setWiek] = useState(35);
  const [wiekEmerytura, setWiekEmerytura] = useState(65);
  const [stopaZwrotu, setStopaZwrotu] = useState(6);
  const [wplata, setWplata] = useState(10000);
  const [podatek, setPodatek] = useState(0.12);
  const [reinwestuj, setReinwestuj] = useState(true);

  const limitIKZE = czyFirma ? CONSTANTS[rok].IKZE_FIRMA : CONSTANTS[rok].IKZE;
  const limitIKE = CONSTANTS[rok].IKE;

  // Pilnowanie limitów i poprawności podatku
  useEffect(() => {
    if (wplata > limitIKZE && wplata > limitIKE) {
      setWplata(Math.max(limitIKZE, limitIKE));
    }
    const dostepnePodatki = czyFirma ? taxes.b2b : taxes.etat;
    if (!dostepnePodatki.find(t => t.value === podatek)) {
      setPodatek(0.12);
    }
  }, [czyFirma, rok, limitIKZE, limitIKE]);

  // GŁÓWNA LOGIKA PORÓWNAWCZA (na bazie arkusza "Robocze" i "KALKULATOR")
  const przeliczWyniki = () => {
    const lata = wiekEmerytura - wiek;
    const r = stopaZwrotu / 100;
    
    if (lata <= 0) return { ike: 0, ikze: 0, ikzePlus: 0, zwrot: 0 };

    // 1. IKE (Brak podatku Belki na końcu)
    const wplataIKE = Math.min(wplata, limitIKE);
    const ikeFinal = wplataIKE * ((Math.pow(1 + r, lata) - 1) / r) * (1 + r);

    // 2. IKZE (Podatek 10% przy wypłacie)
    const wplataIKZE = Math.min(wplata, limitIKZE);
    const zwrotRoczny = wplataIKZE * podatek;
    const ikzeBrutto = wplataIKZE * ((Math.pow(1 + r, lata) - 1) / r) * (1 + r);
    const ikzeFinal = ikzeBrutto * 0.9; // Podatek zryczałtowany 10%

    // 3. IKZE + Reinwestycja zwrotu (Kluczowa strategia FBO)
    // Zwrot podatku reinwestujemy na "zwykłym" koncie (podatek Belki 19% co roku)
    let kontoZwrotow = 0;
    const rNetto = r * (1 - 0.19);
    for (let i = 0; i < lata; i++) {
      kontoZwrotow = (kontoZwrotow + zwrotRoczny) * (1 + rNetto);
    }
    const ikzePlusFinal = ikzeFinal + (reinwestuj ? kontoZwrotow : 0);

    return {
      ike: Math.round(ikeFinal),
      ikze: Math.round(ikzeFinal),
      ikzePlus: Math.round(ikzePlusFinal),
      zwrot: Math.round(zwrotRoczny)
    };
  };

  const wyniki = przeliczWyniki();

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', fontFamily: 'sans-serif', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
      
      {/* Taby */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
        <button onClick={() => setActiveTab('kalkulator')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'kalkulator' ? '#fff' : 'transparent', fontWeight: 'bold', color: activeTab === 'kalkulator' ? '#3182ce' : '#718096', borderBottom: activeTab === 'kalkulator' ? '3px solid #3182ce' : 'none', cursor: 'pointer' }}>Kalkulator</button>
        <button onClick={() => setActiveTab('info')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'info' ? '#fff' : 'transparent', fontWeight: 'bold', color: activeTab === 'info' ? '#3182ce' : '#718096', borderBottom: activeTab === 'info' ? '3px solid #3182ce' : 'none', cursor: 'pointer' }}>Informacje</button>
      </div>

      <div style={{ padding: '20px' }}>
        {activeTab === 'kalkulator' ? (
          <div>
            {/* Sekcja parametrów */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Wiek: {wiek} lat</label>
                <input type="range" min="18" max="64" value={wiek} onChange={(e) => setWiek(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Emerytura: {wiekEmerytura} lat</label>
                <input type="range" min={wiek + 1} max="75" value={wiekEmerytura} onChange={(e) => setWiekEmerytura(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Planowana roczna wpłata:</label>
              <input 
                type="number" 
                value={wplata} 
                onChange={(e) => setWplata(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e0' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <select value={czyFirma} onChange={(e) => setCzyFirma(e.target.value === 'true')} style={{ flex: 1, padding: '10px' }}>
                <option value="false">Etat</option>
                <option value="true">B2B (Firma)</option>
              </select>
              <select value={rok} onChange={(e) => setRok(Number(e.target.value))} style={{ flex: 1, padding: '10px' }}>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Podatek: </label>
              <select value={podatek} onChange={(e) => setPodatek(Number(e.target.value))} style={{ width: '100%', padding: '10px' }}>
                {(czyFirma ? taxes.b2b : taxes.etat).map(t => <option key={t.label} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f7fafc', borderRadius: '8px', border: '1px solid #edf2f7' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                <input 
                  type="checkbox" 
                  checked={reinwestuj} 
                  onChange={(e) => setReinwestuj(e.target.checked)} 
                  style={{ marginRight: '10px', width: '18px', height: '18px' }}
                />
                Reinwestuj coroczny zwrot z IKZE ({wyniki.zwrot} zł)
              </label>
            </div>

            {/* Wyniki końcowe */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#ebf8ff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#2b6cb0' }}>Finał w IKE</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{wyniki.ike.toLocaleString()} zł</div>
              </div>
              <div style={{ background: '#f0fff4', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#276749' }}>Finał w IKZE*</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{wyniki.ikzePlus.toLocaleString()} zł</div>
              </div>
            </div>
            <p style={{ fontSize: '10px', color: '#a0aec0', marginTop: '10px', textAlign: 'center' }}>
              *Uwzględnia 10% podatku przy wypłacie {reinwestuj && "oraz reinwestycję ulgi"}.
            </p>
          </div>
        ) : <InfoPage />}
      </div>
    </div>
  );
}

export default App;