import { ParsedListingData } from '@/api/ai-parser.api';
import { InternalCategory } from '@/types';
import { WizardData } from '../types';

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function findCategoryId(
  tree: InternalCategory[],
  categoryName: string | null,
  subcategoryName: string | null,
): string | undefined {
  if (!categoryName && !subcategoryName) return undefined;

  const target = normalize(subcategoryName ?? categoryName ?? '');
  if (!target) return undefined;

  for (const parent of tree) {
    for (const child of parent.children ?? []) {
      const childName = normalize(child.name);
      if (childName === target || childName.includes(target) || target.includes(childName)) {
        return child.id;
      }
    }
    const parentName = normalize(parent.name);
    if (parentName === target || parentName.includes(target) || target.includes(parentName)) {
      if (!parent.children?.length) return parent.id;
    }
  }
  return undefined;
}

function buildAutoTitle(
  tree: InternalCategory[],
  patch: Partial<WizardData>,
): string | undefined {
  const parts: string[] = [];
  if (patch.categoryId) {
    const cat = tree.flatMap((c) => [c, ...(c.children ?? [])]).find((c) => c.id === patch.categoryId);
    if (cat) parts.push(cat.name);
  }
  if (patch.partSide && patch.partSide !== 'Nie dotyczy') parts.push(patch.partSide.toLowerCase());
  if (patch.condition === 'USED') parts.push('używana');
  if (patch.condition === 'DAMAGED') parts.push('uszkodzona');
  return parts.length > 0 ? parts.join(' ') : undefined;
}

export function mapAiParsedToWizard(
  parsed: ParsedListingData,
  categories: InternalCategory[],
): Partial<WizardData> {
  const categoryId = findCategoryId(categories, parsed.partCategory, parsed.partSubcategory);

  const patch: Partial<WizardData> = {
    identMethod: 'AI_PARSED',
    vehicleYearRaw: parsed.vehicleYear ?? undefined,
    partSide: parsed.partSide ?? undefined,
    condition: parsed.condition ?? undefined,
    catalogNumber: parsed.catalogNumber ?? undefined,
    categoryId,
  };

  const title = buildAutoTitle(categories, patch);
  if (title) patch.title = title;

  if (parsed.vehicleMake || parsed.vehicleModel) {
    const vehicleHint = [parsed.vehicleMake, parsed.vehicleModel, parsed.vehicleYear]
      .filter(Boolean)
      .join(' ');
    patch.partDetails = vehicleHint;
  }

  return patch;
}
