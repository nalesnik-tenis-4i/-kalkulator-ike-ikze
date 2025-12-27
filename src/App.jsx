import { useState, useMemo, useEffect } from 'react';
// Zmieniamy import na ten z nowego pliku data.js posrednio przez calculations lub bezposrednio
import { taxes, generateChartData, LIMITS } from './calculations'; 
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import InfoPage from './components/InfoPage';

function App() {
  const [activeTab, setActiveTab] = useState('kalkulator');
  
  // Pobieramy dostępne lata z bazy danych i sortujemy malejąco (2026, 2025...)
  const dostepneLata = useMemo(() => Object.keys(LIMITS).map(Number).sort((a, b) => b - a), []);
  
  const [rok, setRok] = useState(dostepneLata[0]); // Domyślnie najnowszy rok
  const [czyFirma, setCzyFirma] = useState(false);
  
  const [wiek, setWiek] = useState(30);
  const [wiekEmerytura, setWiekEmerytura] = useState(65);
  
  const [stopaZwrotu, setStopaZwrotu] = useState(6);
  const [stopaZwrotuUlga, setStopaZwrotuUlga] = useState(4);
  
  const [wplataIKE, setWplataIKE] = useState(0);
  const [wplataIKZE, setWplataIKZE] = useState(0);

  const [podatek, setPodatek] = useState(0.12);
  const [reinwestuj, setReinwestuj] = useState(true);

  // --- LOGIKA LIMITÓW ---
  const limityRoczne = LIMITS[rok] || LIMITS[2025];
  
  // Jeśli dla danego roku nie ma osobnego limitu dla firmy (np. rok 2018), używamy zwykłego
  const limitIKZE = (czyFirma && limityRoczne.IKZE_FIRMA) 
    ? limityRoczne.IKZE_FIRMA 
    : limityRoczne.IKZE;
    
  const limitIKE = limityRoczne.IKE;

  // Auto-fill przy pierwszym załadowaniu (opcjonalne)
  useEffect(() => {
    setWplataIKE(limitIKE);
    setWplataIKZE(limitIKZE);
  }, []);

  // Walidacja przy zmianie roku/trybu: przytnij wpłaty jeśli przekraczają nowe limity
  useEffect(() => {
    if (wplataIKZE > limitIKZE) setWplataIKZE(limitIKZE);
    if (wplataIKE > limitIKE) setWplataIKE(limitIKE);
  }, [rok, czyFirma, limitIKZE, limitIKE]);

  // Synchronizacja podatków (JDG vs Etat)
  useEffect(() => {
    const dostepnePodatki = czyFirma ? taxes.b2b : taxes.etat;
    // Sprawdź czy wybrany podatek istnieje w nowej grupie, jak nie to reset
    const czyIstnieje = dostepnePodatki.some(t => t.value === podatek);
    if (!czyIstnieje) {
      setPodatek(0.12);
    }
  }, [czyFirma]);

  const chartData = useMemo(() => generateChartData({
    wiek, wiekEmerytura, 
    wplataIKE, wplataIKZE, 
    stopaZwrotu, stopaZwrotuUlga, 
    podatekStawka: podatek, reinwestuj
  }), [wiek, wiekEmerytura, wplataIKE, wplataIKZE, stopaZwrotu, stopaZwrotuUlga, podatek, reinwestuj]);

  const final = chartData[chartData.length - 1] || { IKE: 0, IKZE: 0, Zwykle: 0 };

  // Style (te same co wcześniej)
  const cardStyle = { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #e2e8f0' };
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4a5568', marginBottom: '5px' };
  const inputGroupStyle = { display: 'flex', gap: '8px' };
  const inputStyle = { flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px' };
  const btnMaxStyle = { padding: '8px 12px', borderRadius: '6px', border: 'none', background: '#3182ce', color: '#fff', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', backgroundColor: '#fff', minHeight: '100vh', boxShadow: '0 0 20px rgba(0,0,0,0.05)' }}>
      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
        <button onClick={() => setActiveTab('kalkulator')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'kalkulator' ? '#fff' : '#f7fafc', fontWeight: 'bold', color: activeTab === 'kalkulator' ? '#3182ce' : '#718096', borderBottom: activeTab === 'kalkulator' ? '3px solid #3182ce' : 'none', cursor: 'pointer' }}>Kalkulator</button>
        <button onClick={() => setActiveTab('info')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'info' ? '#fff' : '#f7fafc', fontWeight: 'bold', color: activeTab === 'info' ? '#3182ce' : '#718096', borderBottom: activeTab === 'info' ? '3px solid #3182ce' : 'none', cursor: 'pointer' }}>Informacje</button>
      </div>

      <div style={{ padding: '15px 20px 40px 20px' }}>
        {activeTab === 'kalkulator' ? (
          <div>
            
            {/* WIEK I ROK */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 120px' }}>
                <label style={labelStyle}>Twój wiek</label>
                <input type="number" value={wiek} onChange={(e) => setWiek(Number(e.target.value))} style={{ ...inputStyle, width: '100%' }} />
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <label style={labelStyle}>Wiek emerytury</label>
                <input type="number" value={wiekEmerytura} onChange={(e) => setWiekEmerytura(Number(e.target.value))} style={{ ...inputStyle, width: '100%' }} />
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <label style={labelStyle}>Rok limitów</label>
                {/* DYNAMICZNY SELECT */}
                <select value={rok} onChange={(e) => setRok(Number(e.target.value))} style={{ ...inputStyle, width: '100%' }}>
                  {dostepneLata.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* PODATKI */}
            <div style={{ ...cardStyle, background: '#fff', border: '1px solid #cbd5e0' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                 <div style={{ flex: '1 1 150px' }}>
                   <label style={labelStyle}>Typ działalności</label>
                   <select value={czyFirma} onChange={(e) => setCzyFirma(e.target.value === 'true')} style={{ ...inputStyle, width: '100%' }}>
                     <option value="false">Osoba fizyczna (UoP/Zlecenie)</option>
                     <option value="true">Przedsiębiorca (JDG)</option>
                   </select>
                 </div>
                 <div style={{ flex: '1 1 150px' }}>
                   <label style={labelStyle}>Twój próg podatkowy</label>
                   <select value={podatek} onChange={(e) => setPodatek(Number(e.target.value))} style={{ ...inputStyle, width: '100%' }}>
                     {(czyFirma ? taxes.b2b : taxes.etat).map(t => <option key={t.label} value={t.value}>{t.label}</option>)}
                   </select>
                 </div>
              </div>
              
              <div style={{ marginTop: '15px', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                  <input type="checkbox" checked={reinwestuj} onChange={(e) => setReinwestuj(e.target.checked)} style={{ marginRight: '10px', width: '18px', height: '18px' }} />
                  Reinwestuj zwrot podatku z IKZE
                </label>
              </div>
            </div>

            {/* WPŁATY */}
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
              
              {/* KARTA IKE */}
              <div style={{ ...cardStyle, flex: '1 1 300px', borderColor: '#90cdf4', background: '#ebf8ff', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                   <strong style={{ color: '#2b6cb0' }}>IKE</strong>
                   <span style={{ fontSize: '11px', color: '#2c5282' }}>Limit: {limitIKE.toLocaleString()} zł</span>
                </div>
                <label style={labelStyle}>Wpłata roczna</label>
                <div style={inputGroupStyle}>
                  <input 
                    type="number" 
                    value={wplataIKE} 
                    onChange={(e) => setWplataIKE(Math.min(Number(e.target.value), limitIKE))} 
                    style={inputStyle} 
                  />
                  <button onClick={() => setWplataIKE(limitIKE)} style={btnMaxStyle}>MAX</button>
                </div>
              </div>

              {/* KARTA IKZE */}
              <div style={{ ...cardStyle, flex: '1 1 300px', borderColor: '#9ae6b4', background: '#f0fff4', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                   <strong style={{ color: '#276749' }}>IKZE</strong>
                   <span style={{ fontSize: '11px', color: '#22543d' }}>
                     Limit: {limitIKZE.toLocaleString()} zł 
                     {czyFirma && limitIKZE > 10000 && ' (JDG)'}
                   </span>
                </div>
                <label style={labelStyle}>Wpłata roczna</label>
                <div style={inputGroupStyle}>
                  <input 
                    type="number" 
                    value={wplataIKZE} 
                    onChange={(e) => setWplataIKZE(Math.min(Number(e.target.value), limitIKZE))} 
                    style={inputStyle} 
                  />
                  <button onClick={() => setWplataIKZE(limitIKZE)} style={{ ...btnMaxStyle, background: '#38a169' }}>MAX</button>
                </div>
              </div>
            </div>

            {/* WYKRES */}
            <h4 style={{ fontSize: '14px', color: '#718096', marginBottom: '10px', textTransform: 'uppercase' }}>Prognoza kapitału (netto)</h4>
            <div style={{ width: '100%', height: '350px', marginBottom: '30px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="wiek" fontSize={11} stroke="#a0aec0" tickMargin={10} />
                  <YAxis fontSize={11} stroke="#a0aec0" tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(val) => val.toLocaleString() + ' zł'} 
                    labelStyle={{ color: '#718096' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line name="IKE" type="monotone" dataKey="IKE" stroke="#3182ce" dot={false} strokeWidth={3} activeDot={{ r: 6 }} />
                  <Line name="IKZE + Ulga" type="monotone" dataKey="IKZE" stroke="#38a169" dot={false} strokeWidth={3} activeDot={{ r: 6 }} />
                  <Line name="Zwykłe konto" type="monotone" dataKey="Zwykle" stroke="#e53e3e" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* PODSUMOWANIE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
              <div style={{ padding: '15px', background: '#ebf8ff', borderRadius: '10px', textAlign: 'center', border: '1px solid #bee3f8' }}>
                <div style={{ fontSize: '11px', color: '#2c5282', fontWeight: 'bold', textTransform: 'uppercase' }}>IKE (Do ręki)</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#2b6cb0', marginTop: '5px' }}>
                  {final.IKE.toLocaleString()} zł
                </div>
              </div>
              
              <div style={{ padding: '15px', background: '#f0fff4', borderRadius: '10px', textAlign: 'center', border: '1px solid #c6f6d5' }}>
                <div style={{ fontSize: '11px', color: '#22543d', fontWeight: 'bold', textTransform: 'uppercase' }}>IKZE (Do ręki)</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#2f855a', marginTop: '5px' }}>
                  {final.IKZE.toLocaleString()} zł
                </div>
              </div>

              <div style={{ padding: '15px', background: '#fff', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                 <div style={{ fontSize: '11px', color: '#718096', fontWeight: 'bold', textTransform: 'uppercase' }}>Zysk vs Zwykłe</div>
                 <div style={{ fontSize: '18px', fontWeight: '800', color: '#4a5568', marginTop: '5px' }}>
                   +{((final.IKE + final.IKZE) - final.Zwykle * 2).toLocaleString()} zł
                 </div>
              </div>
            </div>

          </div>
        ) : <InfoPage />}
      </div>
    </div>
  );
}

export default App;