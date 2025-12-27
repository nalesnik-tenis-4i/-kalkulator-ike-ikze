import { SOURCES_LINKS } from '../calculations';

export default function InfoPage() {
  return (
    <div style={{ padding: '0 15px', lineHeight: '1.6', textAlign: 'left' }}>
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
        border: '1px solid #c6f6d5',
        width: 'fit-content'
      }}>
        🔒 100% Prywatności: Dane zostają u Ciebie
      </div>

      <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>O Kalkulatorze</h3>
      <p>Aplikacja oblicza potencjalny zysk z kont emerytalnych IKE oraz IKZE w porównaniu do zwykłego konta oszczędnościowego/inwestycyjnego.</p>
      
      <h4>Założenia:</h4>
      <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#4a5568' }}>
        <li>IKE: Brak podatku Belki (19%) przy wypłacie.</li>
        <li>IKZE: Wpłaty odliczane od dochodu teraz, ale przy wypłacie podatek ryczałtowy 10%.</li>
        <li>Reinwestycja ulgi: Zwrot podatku z IKZE jest reinwestowany na zwykłym koncie (opodatkowanym).</li>
      </ul>

      <h3 style={{ marginTop: '25px' }}>Oficjalne Limity</h3>
      <p style={{ fontSize: '14px' }}>Dane historyczne i aktualne na podstawie obwieszczeń Ministerstwa Rodziny i Polityki Społecznej:</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
        <a href={SOURCES_LINKS.gov_ike} target="_blank" rel="noreferrer" style={{ color: '#3182ce', textDecoration: 'none', background: '#ebf8ff', padding: '10px', borderRadius: '6px' }}>
          📄 Limity IKE (gov.pl)
        </a>
        <a href={SOURCES_LINKS.gov_ikze} target="_blank" rel="noreferrer" style={{ color: '#3182ce', textDecoration: 'none', background: '#ebf8ff', padding: '10px', borderRadius: '6px' }}>
          📄 Limity IKZE (gov.pl)
        </a>
      </div>
    </div>
  );
}