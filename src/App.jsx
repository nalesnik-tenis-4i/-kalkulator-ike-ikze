import { useState, useMemo, useEffect } from 'react';
import { taxes, generateChartData, LIMITS } from './calculations'; 
import InfoPage from './components/InfoPage';
import CalculatorForm from './components/CalculatorForm';
import ResultsSection from './components/ResultsSection';
import ModeSelection from './components/ModeSelection';
import ProDashboard from './components/ProDashboard';
import './App.css';

// --- KOMPONENT POPUPU OSTRZEGAWCZEGO ---
const WindowWarning = ({ width }) => {
  // Jeśli jest szeroko (>= 1475px), nie pokazujemy nic
  if (width >= 1475) return null;

  const isCritical = width < 1100;

  // Style dla wersji KRYTYCZNEJ (< 1100px) - Blokuje uwagę
  if (isCritical) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#fff5f5',
        border: '2px solid #e53e3e',
        color: '#c53030',
        padding: '15px 25px',
        borderRadius: '12px',
        zIndex: 9999,
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        textAlign: 'center',
        maxWidth: '90%',
        animation: 'slideDown 0.5s ease-out'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '5px' }}>🛑</div>
        <strong style={{ display: 'block', marginBottom: '5px' }}>Okno jest zdecydowanie za wąskie!</strong>
        <div style={{ fontSize: '13px' }}>
          Tryb PRO wymaga szerokości min. 1100px.<br/>
          Tabela może być nieczytelna. Proszę rozszerzyć okno przeglądarki.
        </div>
      </div>
    );
  }

  // Style dla wersji ŁAGODNEJ (1100 - 1475px) - Dyskretna sugestia
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#fffaf0',
      border: '1px solid #fbd38d',
      borderLeft: '5px solid #dd6b20',
      color: '#7b341e',
      padding: '15px',
      borderRadius: '8px',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontSize: '13px',
      maxWidth: '300px',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <strong style={{ display: 'block', marginBottom: '4px', color: '#c05621' }}>💡 Wskazówka</strong>
      Dla pełnego komfortu pracy z tabelą zalecamy rozszerzenie okna powyżej <strong>1475px</strong>.
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('kalkulator');
  const [tryb, setTryb] = useState(null); // 'porownanie' | 'wlasny' | 'pro' | null
  
  // --- KONFIGURACJA PODSTAWOWA ---
  const dostepneLata = useMemo(() => Object.keys(LIMITS).map(Number).sort((a, b) => b - a), []);
  const [rok, setRok] = useState(dostepneLata[0]);
  const [wiek, setWiek] = useState(30);
  const [wiekEmerytura, setWiekEmerytura] = useState(65);
  const [czyFirma, setCzyFirma] = useState(false);
  const [podatek, setPodatek] = useState(0.12);

  // --- FINANSE ---
  const [stopaZwrotu, setStopaZwrotu] = useState(6);
  const [reinwestuj, setReinwestuj] = useState(true);
  const [stopaZwrotuUlga, setStopaZwrotuUlga] = useState(4); 
  const [iloscWplatRok, setIloscWplatRok] = useState(12);
  
  // Opłaty
  const [oplatyIKE, setOplatyIKE] = useState({ type: 'pln', value: 0 });
  const [oplatyIKZE, setOplatyIKZE] = useState({ type: 'pln', value: 0 });

  // --- WPŁATY ---
  const [wplataIKE, setWplataIKE] = useState(0);
  const [wplataIKZE, setWplataIKZE] = useState(0);
  const [wspolnaKwota, setWspolnaKwota] = useState(0);

  // --- LOGIKA LIMITÓW ---
  const limityRoczne = LIMITS[rok] || LIMITS[2025];
  const limitIKZE = (czyFirma && limityRoczne.IKZE_FIRMA) ? limityRoczne.IKZE_FIRMA : limityRoczne.IKZE;
  const limitIKE = limityRoczne.IKE;
  const limitWspolny = Math.min(limitIKE, limitIKZE);

  // --- DETEKCJA ROZMIARU OKNA ---
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 800);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-init przy wyborze trybu
  useEffect(() => {
    if (tryb === 'wlasny') {
      setWplataIKE(limitIKE);
      setWplataIKZE(limitIKZE);
    } else if (tryb === 'porownanie') {
      setWspolnaKwota(limitWspolny); 
    }
  }, [tryb, limitWspolny, limitIKE, limitIKZE]);

  // Synchronizacja suwaka
  useEffect(() => {
    if (tryb === 'porownanie') {
      const validKwota = Math.min(wspolnaKwota, limitWspolny);
      if (validKwota !== wspolnaKwota) setWspolnaKwota(validKwota);
      setWplataIKE(validKwota);
      setWplataIKZE(validKwota);
    }
  }, [wspolnaKwota, tryb, limitWspolny]);

  // Walidacja w trybie własnym
  useEffect(() => {
    if (tryb === 'wlasny') {
      if (wplataIKZE > limitIKZE) setWplataIKZE(limitIKZE);
      if (wplataIKE > limitIKE) setWplataIKE(limitIKE);
    }
  }, [rok, czyFirma, limitIKZE, limitIKE]);

  // Synchronizacja podatków
  useEffect(() => {
    const dostepnePodatki = czyFirma ? taxes.b2b : taxes.etat;
    if (!dostepnePodatki.some(t => t.value === podatek)) {
      setPodatek(0.12);
    }
  }, [czyFirma]);

  // --- OBLICZENIA ---
  const chartData = useMemo(() => generateChartData({
    wiek, wiekEmerytura, 
    wplataIKE, wplataIKZE, 
    stopaZwrotu, stopaZwrotuUlga, 
    podatekStawka: podatek, reinwestuj,
    iloscWplatRok, oplatyIKE, oplatyIKZE, tryb
  }), [wiek, wiekEmerytura, wplataIKE, wplataIKZE, stopaZwrotu, stopaZwrotuUlga, podatek, reinwestuj, iloscWplatRok, oplatyIKE, oplatyIKZE, tryb]);

  const final = chartData[chartData.length - 1] || { IKE: 0, IKZE: 0, SumaWplat: 0 };
  const labelWplaty = tryb === 'porownanie' ? "Suma wpłat" : "Suma wpłat";

  // --- RENDEROWANIE ---
  return (
    <div className={`app-card ${tryb === 'pro' ? 'app-card-wide' : ''}`}>
      
      {/* HEADER ZAKŁADEK */}
      <div className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'kalkulator' ? 'active' : ''}`} 
          onClick={() => setActiveTab('kalkulator')}
          style={{
            color: activeTab === 'kalkulator' ? '#00A8BB' : '#B2B2B2',
            borderBottomColor: activeTab === 'kalkulator' ? '#00A8BB' : 'transparent'
          }}
        >
          Kalkulator
        </button>
        <button 
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} 
          onClick={() => setActiveTab('info')}
          style={{
            color: activeTab === 'info' ? '#00A8BB' : '#B2B2B2',
            borderBottomColor: activeTab === 'info' ? '#00A8BB' : 'transparent'
          }}
        >
          Informacje
        </button>
      </div>

      <div className="content-container">
        {activeTab === 'kalkulator' ? (
          <>
            {!tryb ? (
              <ModeSelection setTryb={setTryb} isMobile={isMobile} />
            ) : tryb === 'pro' ? (
              // --- WIDOK PRO ---
              <div>
                {/* POPUP OSTRZEGAWCZY (Tylko w PRO i nie na mobile) */}
                {!isMobile && <WindowWarning width={windowWidth} />}

                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                   <button onClick={() => setTryb(null)} style={{ background: '#f7fafc', border: `1px solid #e2e8f0`, padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#B2B2B2', fontWeight: 'bold', fontSize: '12px' }}>
                     ← Wróć do menu
                   </button>
                   <span style={{ fontSize: '12px', color: '#B2B2B2' }}>Tryb Ekspercki</span>
                </div>
                
                <ProDashboard 
                  currentAge={wiek}             
                  retirementAge={wiekEmerytura} 
                  defaultTaxRate={podatek}      
                  defaultIsCompany={czyFirma}   
                  defaultStopa={stopaZwrotu}
                />
              </div>
            ) : (
              // --- WIDOK STANDARDOWY ---
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <button onClick={() => setTryb(null)} style={{ background: '#f7fafc', border: `1px solid #e2e8f0`, padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#B2B2B2', fontWeight: 'bold', fontSize: '12px' }}>
                    ← Zmień tryb
                  </button>
                  <span style={{ marginLeft: '15px', fontWeight: 'bold', color: '#2d3748' }}>
                    {tryb === 'porownanie' ? 'Porównanie IKE vs IKZE 1:1' : 'Kalkulacja własna'}
                  </span>
                </div>

                <CalculatorForm 
                  tryb={tryb}
                  rok={rok} setRok={setRok} dostepneLata={dostepneLata}
                  wiek={wiek} setWiek={setWiek} wiekEmerytura={wiekEmerytura} setWiekEmerytura={setWiekEmerytura}
                  podatek={podatek} setPodatek={setPodatek} czyFirma={czyFirma} setCzyFirma={setCzyFirma}
                  iloscWplatRok={iloscWplatRok} setIloscWplatRok={setIloscWplatRok}
                  wspolnaKwota={wspolnaKwota} setWspolnaKwota={setWspolnaKwota} limitWspolny={limitWspolny}
                  wplataIKE={wplataIKE} setWplataIKE={setWplataIKE} limitIKE={limitIKE}
                  wplataIKZE={wplataIKZE} setWplataIKZE={setWplataIKZE} limitIKZE={limitIKZE}
                  stopaZwrotu={stopaZwrotu} setStopaZwrotu={setStopaZwrotu}
                  reinwestuj={reinwestuj} setReinwestuj={setReinwestuj}
                  stopaZwrotuUlga={stopaZwrotuUlga} setStopaZwrotuUlga={setStopaZwrotuUlga}
                  oplatyIKE={oplatyIKE} setOplatyIKE={setOplatyIKE}
                  oplatyIKZE={oplatyIKZE} setOplatyIKZE={setOplatyIKZE}
                />

                <ResultsSection 
                  chartData={chartData} 
                  final={final} 
                  labelWplaty={labelWplaty} 
                  reinwestuj={reinwestuj} 
                />
              </div>
            )}
          </>
        ) : <InfoPage />}
      </div>
    </div>
  );
}

export default App;