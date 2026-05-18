import { ImageUploader } from '@/components/shared/ImageUploader';
import { cn } from '@/lib/utils';
import { MIN_IMAGES } from './constants';
import { WizardData } from './types';

interface Props {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
  showImageError?: boolean;
}

export function Step3Images({ data, onChange, showImageError }: Props) {
  const missingImages = data.images.length < MIN_IMAGES;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Zdjęcia ogłoszenia *</h3>
        <p className="mt-1 text-sm text-gray-500">
          Pierwsze zdjęcie będzie główne. Wymagane min. {MIN_IMAGES}, maks. 20 zdjęć.
        </p>
      </div>

      <ImageUploader
        files={data.images}
        onChange={(images) => onChange({ images })}
        maxFiles={20}
      />

      {missingImages && (
        <p
          className={cn(
            'rounded-lg border px-4 py-3 text-sm',
            showImageError
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-amber-200 bg-amber-50 text-amber-700',
          )}
        >
          {showImageError
            ? 'Dodaj co najmniej jedno zdjęcie, aby przejść dalej.'
            : 'Ogłoszenie bez zdjęć sprzedaje się znacznie gorzej.'}
        </p>
      )}
    </div>
  );
}
