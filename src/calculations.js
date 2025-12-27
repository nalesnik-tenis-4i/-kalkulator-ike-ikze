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
    oplatyIKE, oplatyIKZE, // { type: 'pln' | '%', value: number }
    tryb // 'porownanie' | 'wlasny'
  } = params;
  
  const lata = Math.max(0, wiekEmerytura - wiek);
  
  // Oprocentowanie miesięczne
  const rMiesieczny = (stopaZwrotu / 100) / 12;
  // Jeśli reinwestujemy, używamy podanej stopy, jeśli nie - 0% (pieniądze leżą na koncie nieoprocentowanym)
  const rUlgaMiesieczny = reinwestuj ? (stopaZwrotuUlga / 100) / 12 : 0;
  
  const podatekBelki = 0.19;
  
  const kwotaNaPrzelewIKE = wplataIKE / iloscWplatRok;
  const kwotaNaPrzelewIKZE = wplataIKZE / iloscWplatRok;
  const interwalWplat = 12 / iloscWplatRok; 

  const zwrotRoczny = wplataIKZE * podatekStawka;
  const miesiacZwrotu = 5; // Maj

  let data = [];
  let ike = 0;
  let ikze = 0;
  let ulgaAkumulowana = 0; // To jest "portfel" ze zwrotami podatku
  let sumaWplat = 0;

  data.push({
    wiek: wiek,
    IKE: 0,
    IKZE: 0,
    SumaWplat: 0
  });

  for (let rokIdx = 1; rokIdx <= lata; rokIdx++) {
    for (let m = 1; m <= 12; m++) {
      // 1. Kapitalizacja (zysk)
      ike = ike * (1 + rMiesieczny);
      ikze = ikze * (1 + rMiesieczny);
      
      // Portfel z ulgą też zarabia (lub nie, jeśli rUlgaMiesieczny = 0)
      // Zysk z ulgi jest opodatkowany Belką
      ulgaAkumulowana = ulgaAkumulowana * (1 + rUlgaMiesieczny * (1 - podatekBelki));

      // 2. Opłaty (pobierane miesięcznie)
      if (oplatyIKE.value > 0) {
        let oplata = oplatyIKE.type === '%' ? (ike * (oplatyIKE.value / 100) / 12) : (oplatyIKE.value / 12);
        ike = Math.max(0, ike - oplata);
      }
      if (oplatyIKZE.value > 0) {
        let oplata = oplatyIKZE.type === '%' ? (ikze * (oplatyIKZE.value / 100) / 12) : (oplatyIKZE.value / 12);
        ikze = Math.max(0, ikze - oplata);
      }

      // 3. Wpłaty
      if ((m - 1) % interwalWplat === 0) {
        ike += kwotaNaPrzelewIKE;
        ikze += kwotaNaPrzelewIKZE;
        
        // Logika sumy wpłat dla wykresu
        if (tryb === 'porownanie') {
          // W trybie porównania (np. 5000 IKE vs 5000 IKZE) interesuje nas, 
          // że wyciągnęliśmy z portfela 5000, a nie 10000.
          // Bierzemy max z obu, bo w tym trybie są równe (lub limitowane), 
          // reprezentuje to "Budżet Inwestycyjny".
          sumaWplat += Math.max(kwotaNaPrzelewIKE, kwotaNaPrzelewIKZE); 
        } else {
          // W trybie własnym sumujemy wszystko co wpłacamy
          sumaWplat += (kwotaNaPrzelewIKE + kwotaNaPrzelewIKZE);
        }
      }

      // 4. Zwrot podatku (wpada do "kieszeni" raz w roku)
      if (m === miesiacZwrotu) {
        ulgaAkumulowana += zwrotRoczny;
      }
    }

    data.push({
      wiek: wiek + rokIdx,
      IKE: Math.round(ike),
      // IKZE Netto = (Kapitał IKZE - 10% ryczałtu) + (Ulga z reinwestycji lub gotówka w kieszeni)
      IKZE: Math.round((ikze * 0.9) + ulgaAkumulowana), 
      SumaWplat: Math.round(sumaWplat)
    });
  }
  return data;
};