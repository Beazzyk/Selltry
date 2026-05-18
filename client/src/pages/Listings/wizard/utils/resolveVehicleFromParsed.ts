import { getVehicleMakes, getVehicleModels } from '@/api/categories.api';
import { ParsedListingData } from '@/api/ai-parser.api';
import { VehicleType } from '@/types';

function fuzzyMatch(a: string, b: string): boolean {
  const left = a.toLowerCase().trim();
  const right = b.toLowerCase().trim();
  return left === right || left.includes(right) || right.includes(left);
}

export async function resolveVehicleFromParsed(
  parsed: ParsedListingData,
  vehicleType: VehicleType,
): Promise<{ vehicleMakeId?: string; vehicleModelId?: string; vehicleYearRaw?: number }> {
  const yearPatch = parsed.vehicleYear ? { vehicleYearRaw: parsed.vehicleYear } : {};

  if (!parsed.vehicleMake) return yearPatch;

  const makes = await getVehicleMakes(vehicleType);
  const make = makes.find((item) => fuzzyMatch(item.name, parsed.vehicleMake!));
  if (!make) return yearPatch;

  const patch: { vehicleMakeId?: string; vehicleModelId?: string; vehicleYearRaw?: number } = {
    vehicleMakeId: make.id,
    ...yearPatch,
  };

  if (!parsed.vehicleModel) return patch;

  const models = await getVehicleModels(make.id);
  const model = models.find((item) => fuzzyMatch(item.name, parsed.vehicleModel!));
  if (model) patch.vehicleModelId = model.id;

  return patch;
}
