export const PLATFORMS = ['Allegro', 'Ovoko', 'Otomoto', 'OLX', 'eBay'] as const;

export const FEATURES = [
  {
    title: 'Jeden kreator, wiele platform',
    description:
      'Wypełniasz dane raz — tytuły, kategorie i ceny dostosowujemy do wymagań każdego marketplace’u.',
    icon: 'layers' as const,
  },
  {
    title: 'AI Parser opisu',
    description:
      'Wklej tekst z WhatsAppa lub notatki — system rozpozna część, pojazd i stan, a formularz się uzupełni.',
    icon: 'sparkles' as const,
  },
  {
    title: 'Szkice i bezpieczny zapis',
    description:
      'Postęp kreatora zapisuje się automatycznie. Wróć do ogłoszenia w dowolnym momencie bez utraty danych.',
    icon: 'shield' as const,
  },
  {
    title: 'Marże i ceny końcowe',
    description:
      'Ustaw reguły per platforma i od razu widzisz cenę wystawienia przed publikacją.',
    icon: 'trending' as const,
  },
] as const;

export const STEPS = [
  { step: '01', title: 'Opisz część', desc: 'Formularz lub AI Parser — kategoria i tytuł gotowe w minutę.' },
  { step: '02', title: 'Dodaj zdjęcia', desc: 'Min. jedno zdjęcie, opcjonalnie dopasowanie do pojazdu.' },
  { step: '03', title: 'Wystaw wszędzie', desc: 'Wybierz platformy — resztą zajmie się AutoLister.' },
] as const;

export const STATS = [
  { value: '5', label: 'platform w jednym panelu' },
  { value: '3', label: 'kroki do publikacji' },
  { value: '1×', label: 'wprowadzanie danych' },
] as const;
