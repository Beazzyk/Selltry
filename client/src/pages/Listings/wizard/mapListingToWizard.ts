import { Listing } from '@/types';
import { WizardData } from './types';

export function mapListingToWizard(listing: Listing): WizardData {
  return {
    identMethod: listing.identMethod,
    vin: listing.vin,
    catalogNumber: listing.catalogNumber,
    vehicleType: listing.vehicleType,
    vehicleMakeId: listing.vehicleMakeId,
    vehicleModelId: listing.vehicleModelId,
    vehicleGenId: listing.vehicleGenId,
    vehicleYearRaw: listing.vehicleYearRaw,
    vehicleEngine: listing.vehicleEngine,
    categoryId: listing.categoryId,
    partSide: listing.partSide,
    condition: listing.condition,
    title: listing.title,
    description: listing.description,
    partDetails: listing.partDetails,
    damageDescription: listing.damageDescription,
    basePrice: Number(listing.basePrice),
    quantity: listing.quantity,
    selectedPlatforms: listing.platformListings.map((item) => item.platform),
    images: [],
  };
}
