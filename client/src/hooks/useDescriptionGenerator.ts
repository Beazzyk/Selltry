import { useState } from 'react';
import { generateDescription } from '@/api/listings.api';
import { WizardData } from '@/pages/Listings/wizard/types';

export function useDescriptionGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(data: WizardData, onChange: (patch: Partial<WizardData>) => void) {
    if (!data.condition || !data.title) {
      setError('Wypełnij najpierw tytuł i stan produktu');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const attrs = data.attributes ?? {};
      const result = await generateDescription({
        categoryType: data.categoryType ?? 'OTHER',
        brand: typeof attrs.brand === 'string' ? attrs.brand : undefined,
        productModel: typeof attrs.productModel === 'string' ? attrs.productModel : undefined,
        condition: data.condition,
        title: data.title,
        partSide: data.partSide,
        vehicleYear: data.vehicleYearRaw,
        attributes: attrs,
      });

      onChange({ description: result.description });
    } catch {
      setError('Błąd generowania opisu. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  return { generate, loading, error };
}
