import { LIMITS, SOURCES_LINKS } from './data';

export { LIMITS, SOURCES_LINKS };

export const taxes = {
  etat: [
    { label: '12% (I próg)', value: 0.12 },
    { label: '32% (II próg)', value: 0.32 }
  ],
  b2b: [
    { label: '12% (Skala)', value: 0.12 },
    { label: '32% (Skala)', value: 0.32 },
    { label: '19% (Liniowy)', value: 0.19 },
    { label: 'Ryczałt / Inne', value: 0.00 }
  ]
};

export const generateChartData = (params) => {
  const { 
    wiek, wiekEmerytura, 
    wplataIKE, wplataIKZE, 
    stopaZwrotu, stopaZwrotuUlga, 
    podatekStawka, reinwestuj,
    iloscWplatRok,
    oplatyIKE, oplatyIKZE, 
    tryb 
  } = params;
  
  const lata = Math.max(0, wiekEmerytura - wiek);
  
  const rMiesieczny = (stopaZwrotu / 100) / 12;
  const rUlgaMiesieczny = reinwestuj ? (stopaZwrotuUlga / 100) / 12 : 0;
  const podatekBelki = 0.19;
  
  // Kwoty wpłat (bez zaokrąglania pośredniego)
  const kwotaNaPrzelewIKE = wplataIKE / iloscWplatRok;
  const kwotaNaPrzelewIKZE = wplataIKZE / iloscWplatRok;
  
  // Interwał (co ile miesięcy wpłata)
  // 12 wpłat -> co 1 msc, 4 wpłaty -> co 3 msc, 1 wpłata -> co 12 msc
  const interwalWplat = 12 / iloscWplatRok; 

  const zwrotRoczny = wplataIKZE * podatekStawka;
  const miesiacZwrotu = 5; // Maj (przyjmujemy, że wtedy wpada zwrot podatku)

  let data = [];
  
  let ike = 0;
  let ikze = 0;
  let ulgaAkumulowana = 0; 
  let sumaWplat = 0;

  // Punkt startowy (Wiek: 30.0)
  data.push({
    wiekRaw: wiek, // Dokładna wartość do osi X (np. 30.08)
    labelWiek: wiek, // Etykieta tylko dla pełnych lat
    IKE: 0,
    IKZE: 0,
    SumaWplat: 0
  });

  for (let rokIdx = 1; rokIdx <= lata; rokIdx++) {
    for (let m = 1; m <= 12; m++) {
      
      // 1. WPŁATY (NAJPIERW WPŁACAMY, POTEM TO PRACUJE W TYM MIESIĄCU - LUB ODWROTNIE, ZALEŻY OD MODELU)
      // Przyjmijmy model: Wpłata na początku okresu -> pracuje cały miesiąc.
      // Lub Wpłata na koniec -> nie pracuje w tym miesiącu.
      // Żeby wykres "rósł" od razu po wpłacie, zróbmy wpłatę na początku.
      
      const czyWplata = ((m - 1) % interwalWplat) === 0;

      if (czyWplata) {
        // Opłata wstępna? Tutaj pomijamy, zakładamy opłaty za zarządzanie.
        ike += kwotaNaPrzelewIKE;
        ikze += kwotaNaPrzelewIKZE;
        
        if (tryb === 'porownanie') {
          sumaWplat += Math.max(kwotaNaPrzelewIKE, kwotaNaPrzelewIKZE); 
        } else {
          sumaWplat += (kwotaNaPrzelewIKE + kwotaNaPrzelewIKZE);
        }
      }

      // 2. Zwrot podatku (wpadnie w Maju i zacznie pracować od tego momentu)
      if (m === miesiacZwrotu) {
        ulgaAkumulowana += zwrotRoczny;
      }

      // 3. Opłaty (pobierane miesięcznie od aktywów)
      if (oplatyIKE.value > 0) {
        let oplata = oplatyIKE.type === '%' ? (ike * (oplatyIKE.value / 100) / 12) : (oplatyIKE.value / 12);
        ike = Math.max(0, ike - oplata);
      }
      if (oplatyIKZE.value > 0) {
        let oplata = oplatyIKZE.type === '%' ? (ikze * (oplatyIKZE.value / 100) / 12) : (oplatyIKZE.value / 12);
        ikze = Math.max(0, ikze - oplata);
      }

      // 4. Kapitalizacja (Zysk na koniec miesiąca)
      ike = ike * (1 + rMiesieczny);
      ikze = ikze * (1 + rMiesieczny);
      ulgaAkumulowana = ulgaAkumulowana * (1 + rUlgaMiesieczny * (1 - podatekBelki));

      // --- ZAPIS DANYCH DO WYKRESU (CO MIESIĄC) ---
      // Dzięki temu wykres zareaguje na "schodki" wpłat
      
      const currentAge = wiek + (rokIdx - 1) + (m / 12);
      
      data.push({
        wiekRaw: currentAge,
        // Etykietę roku dajemy tylko w styczniu, żeby nie zaśmiecać osi X
        labelWiek: m === 12 ? (wiek + rokIdx) : '', 
        // NIE ZAOKRĄGLAMY TUTAJ - dopiero przy wyświetlaniu
        IKE: ike, 
        IKZE: (ikze * 0.9) + ulgaAkumulowana, 
        SumaWplat: sumaWplat
      });
    }
  }
  return data;
};