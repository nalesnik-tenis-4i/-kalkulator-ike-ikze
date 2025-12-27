import { useState, useMemo, useEffect } from 'react';
import { taxes, generateChartData, LIMITS } from './calculations'; 
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import InfoPage from './components/InfoPage';
import { FeeInput, SummaryResults } from './components/CalculatorComponents';

function App() {
  const [activeTab, setActiveTab] = useState('kalkulator');
  const [tryb, setTryb] = useState(null); // 'porownanie' | 'wlasny' | null
  
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
  
  // Opłaty (nowe)
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

  // Limit dla trybu porównania (nie możemy wpłacić więcej niż pozwala mniejszy limit, bo porównanie 1:1 traci sens)
  const limitWspolny = Math.min(limitIKE, limitIKZE);

  // Auto-init przy wyborze trybu
  useEffect(() => {
    if (tryb === 'wlasny') {
      setWplataIKE(limitIKE);
      setWplataIKZE(limitIKZE);
    } else if (tryb === 'porownanie') {
      setWspolnaKwota(limitWspolny); // Defaultowo MAX wspólny
    }
  }, [tryb, limitWspolny, limitIKE, limitIKZE]);

  // Synchronizacja suwaka w trybie porównania
  useEffect(() => {
    if (tryb === 'porownanie') {
      // Upewnij się, że wspólna kwota nie przekracza nowego limitu (np. przy zmianie roku)
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

  // --- CHART DATA ---
  const chartData = useMemo(() => generateChartData({
    wiek, wiekEmerytura, 
    wplataIKE, wplataIKZE, 
    stopaZwrotu, stopaZwrotuUlga, 
    podatekStawka: podatek, reinwestuj,
    iloscWplatRok, oplatyIKE, oplatyIKZE, tryb
  }), [wiek, wiekEmerytura, wplataIKE, wplataIKZE, stopaZwrotu, stopaZwrotuUlga, podatek, reinwestuj, iloscWplatRok, oplatyIKE, oplatyIKZE, tryb]);

  const final = chartData[chartData.length - 1] || { IKE: 0, IKZE: 0, SumaWplat: 0 };

  // --- STYLES ---
  const containerStyle = { maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', backgroundColor: '#fff', minHeight: '100vh' };
  const cardStyle = { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' };
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '15px', boxSizing: 'border-box' };

  return (
    <div style={containerStyle}>
      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', zIndex: 10, backdropFilter: 'blur(5px)' }}>
        <button onClick={() => setActiveTab('kalkulator')} style={{ flex: 1, padding: '16px', border: 'none', background: 'transparent', fontWeight: 'bold', color: activeTab === 'kalkulator' ? '#3182ce' : '#718096', borderBottom: activeTab === 'kalkulator' ? '3px solid #3182ce' : 'none', cursor: 'pointer' }}>Kalkulator</button>
        <button onClick={() => setActiveTab('info')} style={{ flex: 1, padding: '16px', border: 'none', background: 'transparent', fontWeight: 'bold', color: activeTab === 'info' ? '#3182ce' : '#718096', borderBottom: activeTab === 'info' ? '3px solid #3182ce' : 'none', cursor: 'pointer' }}>Informacje</button>
      </div>

      <div style={{ padding: '20px 20px 60px 20px' }}>
        {activeTab === 'kalkulator' ? (
          <>
            {/* TRYB WYBORU */}
            {!tryb ? (
              <div style={{ textAlign: 'center', marginTop: '60px', maxWidth: '500px', margin: '60px auto' }}>
                <h2 style={{ marginBottom: '40px', color: '#1a202c', fontSize: '24px' }}>Wybierz scenariusz</h2>
                <button onClick={() => setTryb('porownanie')} style={{ width: '100%', padding: '25px', marginBottom: '20px', border: '2px solid #bee3f8', borderRadius: '15px', background: '#ebf8ff', cursor: 'pointer', textAlign: 'left', transition: 'transform 0.1s' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '5px' }}>⚖️ Porównaj IKE vs IKZE</div>
                  <div style={{ color: '#4a5568' }}>Sprawdź co się bardziej opłaca przy tej samej kwocie wpłaty.</div>
                </button>
                <button onClick={() => setTryb('wlasny')} style={{ width: '100%', padding: '25px', border: '2px solid #e2e8f0', borderRadius: '15px', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4a5568', marginBottom: '5px' }}>✏️ Kalkulacja własna</div>
                  <div style={{ color: '#718096' }}>Wpisz dowolne kwoty dla IKE i IKZE niezależnie.</div>
                </button>
              </div>
            ) : (
              <div>
                {/* NAGŁÓWEK Z POWROTEM */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <button onClick={() => setTryb(null)} style={{ background: '#edf2f7', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#4a5568', fontWeight: 'bold', fontSize: '12px' }}>
                    ← Zmień tryb
                  </button>
                  <span style={{ marginLeft: '15px', fontWeight: 'bold', color: '#2d3748' }}>
                    {tryb === 'porownanie' ? 'Porównanie 1:1' : 'Kalkulacja własna'}
                  </span>
                </div>

                {/* --- SEKCJA 1: DANE OSOBOWE I PODATKOWE --- */}
                <div style={cardStyle}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                    <div>
                      <label style={labelStyle}>Wiek obecny</label>
                      <input type="number" value={wiek} onChange={(e) => setWiek(Number(e.target.value))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Wiek emerytury</label>
                      <input type="number" value={wiekEmerytura} onChange={(e) => setWiekEmerytura(Number(e.target.value))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Rok limitów</label>
                      <select value={rok} onChange={(e) => setRok(Number(e.target.value))} style={inputStyle}>
                        {dostepneLata.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '20px', borderTop: '1px solid #edf2f7', paddingTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>Twój podatek (do ulgi IKZE)</label>
                      <select value={podatek} onChange={(e) => setPodatek(Number(e.target.value))} style={inputStyle}>
                        {(czyFirma ? taxes.b2b : taxes.etat).map(t => <option key={t.label} value={t.value}>{t.label}</option>)}
                      </select>
                      <div style={{ marginTop: '8px' }}>
                        <label style={{ fontSize: '12px', color: '#4a5568', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input type="checkbox" checked={czyFirma} onChange={(e) => setCzyFirma(e.target.checked)} style={{ marginRight: '8px' }} />
                          Działalność gospodarcza (B2B)
                        </label>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Częstotliwość wpłat</label>
                      <select value={iloscWplatRok} onChange={(e) => setIloscWplatRok(Number(e.target.value))} style={inputStyle}>
                        <option value="12">Co miesiąc (12)</option>
                        <option value="4">Co kwartał (4)</option>
                        <option value="1">Raz w roku (1)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* --- SEKCJA 2: WPŁATY --- */}
                {tryb === 'porownanie' ? (
                  <div style={{ ...cardStyle, background: '#ebf8ff', borderColor: '#bee3f8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ ...labelStyle, marginBottom: 0, color: '#2c5282' }}>Wspólna kwota inwestycji (rocznie)</label>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2b6cb0' }}>{wspolnaKwota.toLocaleString()} zł</span>
                    </div>
                    
                    {/* SLIDER */}
                    <input 
                      type="range" 
                      min="0" 
                      max={limitWspolny} 
                      step="100" 
                      value={wspolnaKwota} 
                      onChange={(e) => setWspolnaKwota(Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer', accentColor: '#3182ce', marginBottom: '15px' }} 
                    />
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                       <input 
                         type="number" 
                         value={wspolnaKwota} 
                         onChange={(e) => setWspolnaKwota(Math.min(Number(e.target.value), limitWspolny))} 
                         style={inputStyle} 
                       />
                       <button onClick={() => setWspolnaKwota(limitWspolny)} style={{ background: '#3182ce', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 20px', fontWeight: 'bold', cursor: 'pointer' }}>
                         MAX
                       </button>
                    </div>
                    <div style={{ fontSize: '11px', color: '#5a67d8', marginTop: '10px', textAlign: 'center' }}>
                      Limit ograniczony do niższej wartości z pary (zwykle IKZE): {limitWspolny.toLocaleString()} zł
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                    {/* KARTA IKE */}
                    <div style={{ ...cardStyle, background: '#f7fafc', borderColor: '#cbd5e0', marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <strong style={{ color: '#2b6cb0' }}>IKE</strong>
                        <span style={{ fontSize: '11px', color: '#718096' }}>Max: {limitIKE}</span>
                      </div>
                      <input type="number" value={wplataIKE} onChange={(e) => setWplataIKE(Math.min(Number(e.target.value), limitIKE))} style={inputStyle} />
                    </div>
                    {/* KARTA IKZE */}
                    <div style={{ ...cardStyle, background: '#f7fafc', borderColor: '#cbd5e0', marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <strong style={{ color: '#276749' }}>IKZE</strong>
                        <span style={{ fontSize: '11px', color: '#718096' }}>Max: {limitIKZE}</span>
                      </div>
                      <input type="number" value={wplataIKZE} onChange={(e) => setWplataIKZE(Math.min(Number(e.target.value), limitIKZE))} style={inputStyle} />
                    </div>
                  </div>
                )}

                {/* --- SEKCJA 3: PARAMETRY RYNKOWE I OPŁATY --- */}
                <div style={{ ...cardStyle }}>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      {/* ZYSKI */}
                      <div>
                        <label style={labelStyle}>Śr. roczny zwrot (%)</label>
                        <input type="number" step="0.5" value={stopaZwrotu} onChange={(e) => setStopaZwrotu(Number(e.target.value))} style={inputStyle} />
                        
                        <div style={{ marginTop: '15px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: '500', cursor: 'pointer', color: '#2d3748' }}>
                             <input type="checkbox" checked={reinwestuj} onChange={(e) => setReinwestuj(e.target.checked)} style={{ marginRight: '8px', accentColor: '#38a169' }} />
                             Reinwestuję zwrot z IKZE
                          </label>
                          {reinwestuj ? (
                            <div style={{ marginTop: '8px', paddingLeft: '24px' }}>
                              <label style={{ fontSize: '11px', color: '#718096' }}>Zysk z reinwestycji (%):</label>
                              <input type="number" step="0.5" value={stopaZwrotuUlga} onChange={(e) => setStopaZwrotuUlga(Number(e.target.value))} style={{ ...inputStyle, padding: '6px', fontSize: '13px' }} />
                            </div>
                          ) : (
                             <div style={{ marginTop: '8px', paddingLeft: '24px', fontSize: '11px', color: '#a0aec0' }}>
                               Zwrot podatku trafia do kieszeni (0% zysku)
                             </div>
                          )}
                        </div>
                      </div>

                      {/* OPŁATY */}
                      <div style={{ borderLeft: '1px solid #edf2f7', paddingLeft: '20px' }}>
                         <label style={labelStyle}>Opłaty roczne (Konta)</label>
                         <FeeInput label="Opłata IKE" feeData={oplatyIKE} setFeeData={setOplatyIKE} />
                         <FeeInput label="Opłata IKZE" feeData={oplatyIKZE} setFeeData={setOplatyIKZE} />
                      </div>
                   </div>
                </div>

                {/* --- WYKRES --- */}
                <div style={{ marginBottom: '30px', height: '350px' }}>
                   <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#a0aec0', letterSpacing: '1px' }}>Projekcja kapitału</h4>
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="wiek" fontSize={11} stroke="#a0aec0" tickMargin={10} />
                        <YAxis fontSize={11} stroke="#a0aec0" tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
                        <Tooltip 
                          formatter={(val) => Math.round(val).toLocaleString() + ' zł'} 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Line name="Suma wpłat (Kapitał)" type="stepAfter" dataKey="SumaWplat" stroke="#cbd5e0" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                        <Line name="IKE (Netto)" type="monotone" dataKey="IKE" stroke="#3182ce" dot={false} strokeWidth={3} activeDot={{ r: 6 }} />
                        <Line name="IKZE + Zwroty (Netto)" type="monotone" dataKey="IKZE" stroke="#38a169" dot={false} strokeWidth={3} activeDot={{ r: 6 }} />
                      </LineChart>
                   </ResponsiveContainer>
                </div>

                {/* --- PODSUMOWANIE --- */}
                <SummaryResults final={final} reinwestuj={reinwestuj} />

              </div>
            )}
          </>
        ) : <InfoPage />}
      </div>
    </div>
  );
}

export default App;