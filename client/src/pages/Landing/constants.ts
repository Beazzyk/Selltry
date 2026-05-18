export const PLATFORMS = ['Allegro', 'Ovoko', 'Otomoto', 'OLX', 'eBay'] as const;

export const FEATURES = [
  {
    title: 'Jeden kreator, wiele platform',
    description:
      "Wypelniasz dane raz - tytuly, kategorie i ceny dostosowujemy automatycznie do wymagan kazdego marketplace'u.",
    icon: 'layers' as const,
  },
  {
    title: 'AI uzupelnia formularz',
    description:
      'Wklej opis wlasnymi slowami - AI rozpozna kategorie, stan, marke i wygeneruje gotowy tytul ogloszenia.',
    icon: 'sparkles' as const,
  },
  {
    title: 'Szkice zapisuja sie same',
    description:
      'Postep kreatora jest automatycznie zachowywany. Wroc do ogloszenia w dowolnym momencie bez utraty danych.',
    icon: 'shield' as const,
  },
  {
    title: 'Marze i ceny koncowe',
    description:
      'Ustaw reguly cenowe per platforma i natychmiast widzisz cene wystawienia przed publikacja.',
    icon: 'trending' as const,
  },
] as const;

export const STEPS = [
  { step: '01', title: 'Opisz produkt', desc: 'Formularz lub AI Parser - kategoria i tytul gotowe w minute.' },
  { step: '02', title: 'Dodaj zdjecia', desc: 'Minimum jedno zdjecie - mozesz dodac wiecej z dowolnego urzadzenia.' },
  { step: '03', title: 'Wystaw wszedzie', desc: 'Wybierz platformy - reszta zajmie sie Selltry.' },
] as const;

export const STATS = [
  { value: '5', label: 'platform w jednym panelu' },
  { value: '3', label: 'kroki do publikacji' },
  { value: '1x', label: 'wprowadzanie danych' },
] as const;
