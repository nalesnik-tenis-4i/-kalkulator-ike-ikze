// src/validators.js

export const validateAge = (val) => {
  if (val === '' || val === 0) return null; // Puste jest ok w trakcie wpisywania
  if (val < 16 || val > 99) return "Wiek musi mieścić się w przedziale 16 - 99 lat.";
  return null;
};

export const validateRetirementAge = (val) => {
  if (val === '' || val === 0) return null;
  if (val < 45 || val > 100) return "Wiek emerytury musi mieścić się w przedziale 45 - 100 lat.";
  return null;
};

// Funkcja zwraca obiekt { value, warning }
// warning jest null, jeśli wszystko ok, lub tekstem, jeśli nastąpiło obcięcie
export const sanitizePercentage = (val) => {
  if (val === '' || val === undefined) return { value: 0, warning: null };
  
  let num = Number(val);
  
  // Jeśli to nie liczba
  if (isNaN(num)) return { value: 0, warning: null };

  // Sprawdzenie zakresu 0-100
  if (num < 0) return { value: 0, warning: "Wartość nie może być ujemna." };
  if (num > 100) return { value: 100, warning: "Maksymalna wartość to 100%." };

  // Sprawdzenie miejsc po przecinku
  const strVal = val.toString();
  if (strVal.includes('.')) {
    const parts = strVal.split('.');
    if (parts[1].length > 2) {
      // Skracamy do 2 miejsc
      const fixed = Number(num.toFixed(2));
      // Hack: returnujemy stringa z value, żeby input nie skakał, 
      // albo number. Tutaj number jest bezpieczniejszy dla wykresów.
      return { value: fixed, warning: "Skrócono do 2 miejsc po przecinku." };
    }
  }

  return { value: num, warning: null };
};