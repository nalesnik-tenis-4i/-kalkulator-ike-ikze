import React, { useState, useEffect } from 'react';
import { SOURCES_LINKS } from '../calculations';

export default function InfoPage() {
  // Wykrywanie wersji mobilnej (poniżej 768px)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sectionStyle = {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '2px solid #edf2f7',
    paddingBottom: '10px'
  };

  const listStyle = {
    paddingLeft: '20px',
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '1.8'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', padding: '20px' }}>
      {/* BADGE PRYWATNOŚCI */}
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        backgroundColor: '#f0fff4', 
        color: '#276749', 
        padding: '8px 16px', 
        borderRadius: '20px', 
        fontWeight: 'bold', 
        fontSize: '13px',
        marginBottom: '20px',
        border: '1px solid #c6f6d5'
      }}>
        🔒 100% Prywatności: Wszystkie obliczenia odbywają się w Twojej przeglądarce
      </div>

      {/* SEKCJA 1: O KALKULATORZE */}
      <section style={sectionStyle}>
        <h3 style={titleStyle}>💡 O Kalkulatorze</h3>
        <p style={{ fontSize: '15px', color: '#4a5568' }}>
          To narzędzie pozwala porównać dwa najpopularniejsze sposoby optymalizacji podatkowej emerytury w Polsce: 
          <strong> IKE</strong> (Indywidualne Konto Emerytalne) oraz <strong>IKZE</strong> (Indywidualne Konto Zabezpieczenia Emerytalnego).
        </p>
      </section>

      {/* SEKCJA 2: ZAŁOŻENIA */}
      <section style={sectionStyle}>
        <h3 style={titleStyle}>⚙️ Główne założenia</h3>
        <ul style={listStyle}>
          <li>
            <strong>IKE (po wypłacie netto):</strong> Zakładamy wypłatę całości środków po 60. roku życia. 
            Zysk jest całkowicie zwolniony z 19% podatku od zysków kapitałowych (podatku Belki).
          </li>
          <li>
            <strong>IKZE (po wypłacie netto):</strong> Wpłaty odliczasz od dochodu w zeznaniu rocznym PIT, co generuje natychmiastowy zwrot podatku. 
            Przy wypłacie (po 65. roku życia) państwo pobiera zryczałtowany podatek w wysokości <strong>10% od całości zgromadzonej kwoty</strong>.
          </li>
          <li>
            <strong>Reinwestycja zwrotu:</strong> Jeśli zaznaczysz tę opcję, kalkulator założy, że pieniądze odzyskane z urzędu skarbowego (dzięki uldze IKZE) 
            pracują na osobnym, opodatkowanym subkoncie, a ich końcowa wartość netto powiększa wynik IKZE.
          </li>
          <li>
            <strong>Opłaty:</strong> Obliczenia uwzględniają wpływ opłat za zarządzanie, które potrafią znacząco obniżyć końcowy kapitał przy długim terminie.
          </li>
        </ul>
      </section>

      {/* SEKCJA 3: LINKI */}
      <section style={sectionStyle}>
        <h3 style={titleStyle}>🔗 Oficjalne limity i źródła</h3>
        <p style={{ fontSize: '14px', color: '#718096', marginBottom: '15px' }}>
          Limity wpłat zmieniają się co roku i zależą od prognozowanego przeciętnego wynagrodzenia.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a href={SOURCES_LINKS.gov_ike} target="_blank" rel="noreferrer" style={{ 
            color: '#3182ce', textDecoration: 'none', background: '#ebf8ff', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '500' 
          }}>
            🏢 Limity IKE na stronie gov.pl →
          </a>
          <a href={SOURCES_LINKS.gov_ikze} target="_blank" rel="noreferrer" style={{ 
            color: '#2f855a', textDecoration: 'none', background: '#f0fff4', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '500' 
          }}>
            🏢 Limity IKZE na stronie gov.pl →
          </a>
        </div>
      </section>

      {/* KOMUNIKAT TYLKO DLA MOBILE (Wersja Potężna) */}
      {isMobile && (
        <div style={{ 
          marginTop: '40px', 
          padding: '20px', 
          backgroundColor: '#fffaf0', 
          border: '2px dashed #ed8936', 
          borderRadius: '12px',
          color: '#744210',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🖥️</div>
          <h4 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Wersja PRO na komputerze</h4>
          <p style={{ fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
            Uruchom tę aplikację na dużym ekranie, aby uzyskać dostęp do 
            <strong> szczegółowej tabeli rok-po-roku</strong> oraz widoku porównawczego na żywo.
          </p>
        </div>
      )}

      {/* --- STOPKA AUTORSKA --- */}
      <footer style={{ textAlign: 'center', marginTop: '50px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        <p style={{ color: '#a0aec0', fontSize: '12px', marginBottom: '5px' }}>
          Kalkulator ma charakter edukacyjny i nie stanowi porady inwestycyjnej.
        </p>
        <div style={{ fontSize: '11px', color: '#cbd5e0' }}>
          <div>Autor: Karol Zagórski</div>
          <a href="mailto:karol.zagorski.md@gmail.com" style={{ color: '#cbd5e0', textDecoration: 'none' }}>
            karol.zagorski.md@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}