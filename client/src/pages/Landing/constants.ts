export const PLATFORMS = ['Allegro', 'Ovoko', 'Otomoto', 'OLX', 'eBay'] as const;

export const FEATURES = [
  {
    title: ‘Jeden kreator, wiele platform’,
    description:
      ‘Wypełniasz dane raz — tytuły, kategorie i ceny dostosowujemy automatycznie do wymagań każdego marketplace\’u.’,
    icon: ‘layers’ as const,
  },
  {
    title: ‘AI uzupełnia formularz’,
    description:
      ‘Wklej opis własnymi słowami — AI rozpozna kategorię, stan, markę i wygeneruje gotowy tytuł ogłoszenia.’,
    icon: ‘sparkles’ as const,
  },
  {
    title: ‘Szkice zapisują się same’,
    description:
      ‘Postęp kreatora jest automatycznie zachowywany. Wróć do ogłoszenia w dowolnym momencie bez utraty danych.’,
    icon: ‘shield’ as const,
  },
  {
    title: ‘Marże i ceny końcowe’,
    description:
      ‘Ustaw reguły cenowe per platforma i natychmiast widzisz cenę wystawienia przed publikacją.’,
    icon: ‘trending’ as const,
  },
] as const;

export const STEPS = [
  { step: ‘01’, title: ‘Opisz produkt’, desc: ‘Formularz lub AI Parser — kategoria i tytuł gotowe w minutę.’ },
  { step: ‘02’, title: ‘Dodaj zdjęcia’, desc: ‘Minimum jedno zdjęcie — możesz dodać więcej z dowolnego urządzenia.’ },
  { step: ‘03’, title: ‘Wystaw wszędzie’, desc: ‘Wybierz platformy — resztą zajmie się Selltry.’ },
] as const;

export const STATS = [
  { value: '5', label: 'platform w jednym panelu' },
  { value: '3', label: 'kroki do publikacji' },
  { value: '1×', label: 'wprowadzanie danych' },
] as const;
