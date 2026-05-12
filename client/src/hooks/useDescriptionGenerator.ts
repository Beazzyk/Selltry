import { useState } from 'react';
import { generateDescription } from '@/api/listings.api';
import { WizardData } from '@/pages/Listings/wizard/types';

export function useDescriptionGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(data: WizardData, onChange: (patch: Partial<WizardData>) => void) {
    if (!data.categoryType) {
      setError('Wybierz najpierw kategorię');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const attrs = data.attributes ?? {};
      const result = await generateDescription({
        categoryType: data.categoryType,
        brand: typeof attrs.brand === 'string' ? attrs.brand : undefined,
        productModel: typeof attrs.productModel === 'string' ? attrs.productModel : undefined,
        condition: data.condition ?? 'USED',
        title: data.title ?? '',
        partSide: data.partSide,
        vehicleYear: data.vehicleYearRaw,
        attributes: attrs,
      });

      onChange({
        ...(result.title ? { title: result.title } : {}),
        platformTitles: result.platformTitles,
        description: result.description,
      });
    } catch {
      setError('Błąd generowania. Sprawdź klucz API lub spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  return { generate, loading, error };
}
