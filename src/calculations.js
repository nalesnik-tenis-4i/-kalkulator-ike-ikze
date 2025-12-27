export const CONSTANTS = {
  2025: { IKE: 24792, IKZE: 10407.60, IKZE_FIRMA: 15611.40 },
  2026: { IKE: 26910, IKZE: 11304.00, IKZE_FIRMA: 16956.00 }
};

export const SOURCES = {
  gov_link: "https://www.gov.pl/web/rodzina/ikze-limit-wplat"
};

export const taxes = {
  etat: [
    { label: '12% (Skala - I próg)', value: 0.12 },
    { label: '32% (Skala - II próg)', value: 0.32 }
  ],
  b2b: [
    { label: '12% (Skala - I próg)', value: 0.12 },
    { label: '32% (Skala - II próg)', value: 0.32 },
    { label: '19% (Liniowy)', value: 0.19 },
    { label: 'Ryczałt / Inne', value: 0.00 }
  ]
};

export const calculateIkzeBonus = (wplata, stawkaPodatkowa, rok, czyFirma) => {
  const limit = czyFirma ? CONSTANTS[rok].IKZE_FIRMA : CONSTANTS[rok].IKZE;
  const realnaWplata = Math.min(wplata, limit);
  return Math.round((realnaWplata * stawkaPodatkowa) * 100) / 100;
};


export const calculateFullComparison = (data) => {
  const { wiek, wiekEmerytura, wplataRoczna, stopaZwrotu, podatekStawka, czyFirma, rok } = data;
  
  const lata = wiekEmerytura - wiek;
  const r = stopaZwrotu / 100;
  const limitIKZE = czyFirma ? CONSTANTS[rok].IKZE_FIRMA : CONSTANTS[rok].IKZE;
  
  // 1. Obliczamy IKZE
  const wplataIKZE = Math.min(wplataRoczna, limitIKZE);
  const zwrotPodatku = wplataIKZE * podatekStawka;
  
  // Wartość IKZE na koniec (przed podatkiem 10%)
  // Wzór na sumę ciągu geometrycznego (wpłaty na początku roku)
  const wartoscIKZE_brutto = wplataIKZE * ((Math.pow(1 + r, lata) - 1) / r) * (1 + r);
  const wartoscIKZE_netto = wartoscIKZE_brutto * 0.9; // Podatek 10% na końcu

  // 2. Obliczamy IKE
  const wplataIKE = Math.min(wplataRoczna, CONSTANTS[rok].IKE);
  const wartoscIKE_netto = wplataIKE * ((Math.pow(1 + r, lata) - 1) / r) * (1 + r); // Brak Belki!

  // 3. Obliczamy "Zwykłe oszczędzanie" (Benchmark) - dla porównania
  // Tutaj płacimy Belkę (19%) co roku od zysku
  let wartoscZwykla = 0;
  for (let i = 0; i < lata; i++) {
    wartoscZwykla = (wartoscZwykla + wplataRoczna) * (1 + r * (1 - 0.19));
  }

  return {
    ikze: Math.round(wartoscIKZE_netto),
    ike: Math.round(wartoscIKE_netto),
    zwykle: Math.round(wartoscZwykla),
    rocznyZwrot: Math.round(zwrotPodatku)
  };
};