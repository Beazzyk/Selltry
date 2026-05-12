import { Trash2 } from 'lucide-react';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { WizardData } from './types';
import { ListingImage } from '@/types';

interface Props {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
  existingImages?: ListingImage[];
  onDeleteExisting?: (id: string) => void;
}

export function Step3Images({ data, onChange, existingImages, onDeleteExisting }: Props) {
  const totalCount = (existingImages?.length ?? 0) + data.images.length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Zdjęcia ogłoszenia</h3>
        <p className="text-sm text-gray-500 mt-1">
          Pierwsze zdjęcie będzie zdjęciem głównym. Dodaj co najmniej 1, maksymalnie 20 zdjęć.
        </p>
      </div>

      {existingImages && existingImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Obecne zdjęcia</p>
          <div className="grid grid-cols-4 gap-2">
            {existingImages.map((img) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {onDeleteExisting && (
                  <button
                    type="button"
                    onClick={() => onDeleteExisting(img.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-5 w-5 text-white" />
                  </button>
                )}
                {img.isMain && (
                  <span className="absolute top-1 left-1 text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded">Główne</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {existingImages && existingImages.length > 0 && (
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dodaj nowe</p>
        )}
        <ImageUploader
          files={data.images}
          onChange={(images) => onChange({ images })}
          maxFiles={Math.max(0, 20 - (existingImages?.length ?? 0))}
        />
      </div>

      {totalCount === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Ogłoszenie bez zdjęć sprzedaje się znacznie gorzej. Dodaj co najmniej 1 zdjęcie.
        </p>
      )}
    </div>
  );
}
