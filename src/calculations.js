// src/calculations.js
import { LIMITS, SOURCES_LINKS } from './data';

// Eksportujemy dane dalej, żeby inne komponenty mogły ich używać
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
    podatekStawka, reinwestuj 
  } = params;
  
  const lata = Math.max(0, wiekEmerytura - wiek);
  const rMiesieczny = (stopaZwrotu / 100) / 12;
  const rUlgaMiesieczny = (stopaZwrotuUlga / 100) / 12;
  const podatekBelki = 0.19;
  
  const wplataMiesiecznaIKE = wplataIKE / 12;
  const wplataMiesiecznaIKZE = wplataIKZE / 12;
  
  // Scenariusz "Zwykłe konto" - suma obu wpłat
  const lacznaWplataRoczna = wplataIKE + wplataIKZE;
  const wplataMiesiecznaZwykla = lacznaWplataRoczna / 12;
  
  const zwrotRoczny = wplataIKZE * podatekStawka;
  const zwrotMiesieczny = zwrotRoczny / 12;

  let data = [];
  let ike = 0;
  let ikze = 0;
  let zwykle = 0;
  let ulgaAkumulowana = 0;
  let sumaWplat = 0;

  data.push({
    wiek: wiek,
    IKE: 0,
    IKZE: 0,
    Zwykle: 0,
    SumaWplat: 0
  });

  for (let rokIdx = 1; rokIdx <= lata; rokIdx++) {
    for (let m = 1; m <= 12; m++) {
      // 1. IKE
      ike = (ike + wplataMiesiecznaIKE) * (1 + rMiesieczny);
      // 2. IKZE
      ikze = (ikze + wplataMiesiecznaIKZE) * (1 + rMiesieczny);
      // 3. Zwykłe
      zwykle = (zwykle + wplataMiesiecznaZwykla) * (1 + rMiesieczny * (1 - podatekBelki));
      // 4. Reinwestycja
      if (reinwestuj) {
        ulgaAkumulowana = (ulgaAkumulowana + zwrotMiesieczny) * (1 + rUlgaMiesieczny * (1 - podatekBelki));
      }
      sumaWplat += wplataMiesiecznaZwykla;
    }

    data.push({
      wiek: wiek + rokIdx,
      IKE: Math.round(ike),
      IKZE: Math.round((ikze * 0.9) + ulgaAkumulowana),
      Zwykle: Math.round(zwykle),
      SumaWplat: Math.round(sumaWplat)
    });
  }
  return data;
};