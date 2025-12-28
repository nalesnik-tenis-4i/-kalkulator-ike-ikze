import { useState, useMemo, useEffect } from 'react';
import { taxes, generateChartData, LIMITS } from './calculations'; 
import InfoPage from './components/InfoPage';
import CalculatorForm from './components/CalculatorForm';
import ResultsSection from './components/ResultsSection';
import ModeSelection from './components/ModeSelection';
import ProDashboard from './components/ProDashboard'; // <--- IMPORT
import './App.css';

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

  // Detekcja Mobile (używamy tego samego progu co w ModeSelection)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-init
  useEffect(() => {
    if (tryb === 'wlasny') {
      setWplataIKE(limitIKE);
      setWplataIKZE(limitIKZE);
    } else if (tryb === 'porownanie') {
      setWspolnaKwota(limitWspolny); 
    }
  }, [tryb, limitWspolny, limitIKE, limitIKZE]);

  // Sync suwaka
  useEffect(() => {
    if (tryb === 'porownanie') {
      const validKwota = Math.min(wspolnaKwota, limitWspolny);
      if (validKwota !== wspolnaKwota) setWspolnaKwota(validKwota);
      setWplataIKE(validKwota);
      setWplataIKZE(validKwota);
    }
  }, [wspolnaKwota, tryb, limitWspolny]);

  // Walidacja 'wlasny'
  useEffect(() => {
    if (tryb === 'wlasny') {
      if (wplataIKZE > limitIKZE) setWplataIKZE(limitIKZE);
      if (wplataIKE > limitIKE) setWplataIKE(limitIKE);
    }
  }, [rok, czyFirma, limitIKZE, limitIKE]);

  // Sync podatku
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
  const labelWplaty = tryb === 'porownanie' ? "Suma wpłat (na IKE lub IKZE)" : "Suma wpłat (na IKE oraz IKZE)";

  // --- RENDERING ---
  // Jeśli tryb to PRO, renderujemy Dashboard zamiast Formularza i Wykresu
  // Jeśli tryb to porownanie/wlasny, renderujemy standardowo
  
  return (
    <div className="app-card">
      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === 'kalkulator' ? 'active' : ''}`} onClick={() => setActiveTab('kalkulator')}>Kalkulator</button>
        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Informacje</button>
      </div>

      <div className="content-container">
        {activeTab === 'kalkulator' ? (
          <>
            {!tryb ? (
              <ModeSelection setTryb={setTryb} isMobile={isMobile} />
            ) : tryb === 'pro' ? (
              // --- WIDOK PRO ---
              <div>
                <div style={{ marginBottom: '20px' }}>
                   <button onClick={() => setTryb(null)} style={{ background: '#edf2f7', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#4a5568', fontWeight: 'bold', fontSize: '12px' }}>← Wróć do menu</button>
                </div>
                {/* PRZEKAZANIE PROPSÓW */}
                <ProDashboard 
                  chartData={chartData} 
                  final={final} 
                  reinwestuj={reinwestuj} 
                />
              </div>
            ) : (
              // --- WIDOK STANDARDOWY (Porównanie / Własny) ---
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <button onClick={() => setTryb(null)} style={{ background: '#edf2f7', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#4a5568', fontWeight: 'bold', fontSize: '12px' }}>
                    ← Zmień tryb
                  </button>
                  <span style={{ marginLeft: '15px', fontWeight: 'bold', color: '#2d3748' }}>
                    {tryb === 'porownanie' ? 'Porównanie 1:1' : 'Kalkulacja własna'}
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