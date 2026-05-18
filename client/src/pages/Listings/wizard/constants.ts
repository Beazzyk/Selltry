export const WIZARD_STEPS = [
  { label: 'Część', desc: 'Kategoria, stan i opis ogłoszenia' },
  { label: 'Pojazd i zdjęcia', desc: 'Dopasowanie pojazdu (opcjonalnie) i zdjęcia' },
  { label: 'Publikacja', desc: 'Cena i wybór platform' },
] as const;

export const MIN_DESCRIPTION_LENGTH = 10;
export const MIN_IMAGES = 1;

export const WIZARD_DRAFT_KEY = 'selltry_listing_wizard_draft';
export const WIZARD_DRAFT_VERSION = 1;
export const WIZARD_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const WIZARD_DRAFT_DEBOUNCE_MS = 800;
