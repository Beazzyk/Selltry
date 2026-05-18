import { MIN_DESCRIPTION_LENGTH, MIN_IMAGES } from './constants';
import { WizardData } from './types';

export function hasMinImages(data: WizardData): boolean {
  return data.images.length >= MIN_IMAGES;
}

export function canProceed(step: number, data: WizardData): boolean {
  if (step === 0) {
    return (
      !!data.categoryId &&
      !!data.condition &&
      !!data.title?.trim() &&
      (data.description?.trim().length ?? 0) >= MIN_DESCRIPTION_LENGTH
    );
  }
  if (step === 1) return hasMinImages(data);
  if (step === 2) return !!data.basePrice && data.basePrice > 0 && hasMinImages(data);
  return false;
}
