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