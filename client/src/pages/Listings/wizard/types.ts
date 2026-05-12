import { CategoryType, Condition, IdentMethod, Platform, VehicleType } from '@/types';

export interface ListingAttributes {
  brand?: string;
  productModel?: string;
  color?: string;
  size?: string;
  material?: string;
  gender?: string;
  warrantyMonths?: number;
  sportType?: string;
  [key: string]: string | number | undefined;
}

export interface WizardData {
  // Step 1 — Category
  categoryType?: CategoryType;
  categoryId?: string;

  // Step 2 — Vehicle (AUTOMOTIVE only)
  identMethod: IdentMethod;
  vin?: string;
  catalogNumber?: string;
  vehicleType: VehicleType;
  vehicleMakeId?: string;
  vehicleMakeName?: string;
  vehicleModelId?: string;
  vehicleModelName?: string;
  vehicleGenId?: string;
  vehicleYearRaw?: number;
  vehicleEngine?: string;
  partSide?: string;
  partDetails?: string;
  damageDescription?: string;

  // Category name (for AI context)
  categoryName?: string;

  // Step 2 — Generic (non-automotive)
  attributes: ListingAttributes;

  // Step 2 — Common
  condition?: Condition;
  title?: string;
  description?: string;

  // Step 3
  images: File[];

  // AI-generated platform title suggestions
  platformTitles?: Record<string, string>;

  // Step 4
  basePrice?: number;
  quantity?: number;
  selectedPlatforms: Platform[];
}

export const WIZARD_DEFAULTS: WizardData = {
  identMethod: 'MANUAL',
  vehicleType: 'CAR',
  attributes: {},
  images: [],
  selectedPlatforms: [],
};

export const AUTOMOTIVE_PLATFORMS: Platform[] = ['ALLEGRO', 'OVOKO', 'OTOMOTO', 'OLX'];
export const UNIVERSAL_PLATFORMS: Platform[] = ['ALLEGRO', 'OLX'];

export function getPlatformsForCategory(categoryType?: CategoryType): Platform[] {
  return categoryType === 'AUTOMOTIVE' ? AUTOMOTIVE_PLATFORMS : UNIVERSAL_PLATFORMS;
}
