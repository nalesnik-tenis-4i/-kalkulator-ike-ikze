export default function InfoPage() {
  return (
    <div style={{ padding: '0 15px', lineHeight: '1.6', textAlign: 'center' }}>
      {/* Zielona pastylka */}
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        backgroundColor: '#f0fff4', 
        color: '#276749', 
        padding: '8px 16px', 
        borderRadius: '20px', 
        fontWeight: 'bold',
        fontSize: '14px',
        marginBottom: '20px',
        border: '1px solid #c6f6d5'
      }}>
        🔒 100% Prywatności
      </div>

      <div style={{ textAlign: 'left' }}>
        <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Jak działa ten kalkulator?</h3>
        <p>Ten kalkulator został stworzony w technologii Client-Side.</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Brak wysyłania danych:</strong> Żadne informacje nie opuszczają Twojego urządzenia.</li>
          <li><strong>Lokalna matematyka:</strong> Cała matematyka dzieje się bezpośrednio w Twojej przeglądarce.</li>
          <li><strong>Anonimowość:</strong> Nie zbieramy żadnych danych (w tym cookies) śledzących Twoje finanse.</li>
        </ul>

        <h3 style={{ marginTop: '25px' }}>Dlaczego warto liczyć samemu?</h3>
        <p>Decyzja między IKE a IKZE zależy od Twojej stawki podatkowej dzisiaj oraz przewidywanej w przyszłości. Ta strona to mobilna adaptacja narzędzi Marcina Iwucia.</p>
        
        <div style={{ marginTop: '30px', padding: '15px', borderTop: '1px solid #e2e8f0', fontSize: '14px', color: '#718096' }}>
          <strong>Autor:</strong> Karol Zagórski<br />
          📧 <a href="mailto:karol.zagorski.md@gmail.com" style={{ color: '#3182ce' }}>karol.zagorski.md@gmail.com</a>
        </div>
      </div>
    </div>
  );
}