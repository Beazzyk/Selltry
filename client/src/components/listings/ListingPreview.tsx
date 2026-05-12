import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WizardData } from '@/pages/Listings/wizard/types';
import { getPlatformsForCategory } from '@/pages/Listings/wizard/types';

interface Props {
  data: WizardData;
  onClose: () => void;
}

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Nowy',
  USED: 'Używany',
  DAMAGED: 'Uszkodzony',
};

const PLATFORM_COLORS: Record<string, string> = {
  ALLEGRO: 'bg-orange-100 text-orange-700',
  OLX: 'bg-lime-100 text-lime-700',
  OTOMOTO: 'bg-blue-100 text-blue-700',
  OVOKO: 'bg-emerald-100 text-emerald-700',
};

export function ListingPreview({ data, onClose }: Props) {
  const platforms = getPlatformsForCategory(data.categoryType);
  const previewImages = data.images.map((f) => URL.createObjectURL(f));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Podgląd ogłoszenia</h2>
            <p className="text-xs text-gray-500">Tak będzie wyglądać Twoje ogłoszenie</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Images */}
          {previewImages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {previewImages.map((url, i) => (
                <img key={i} src={url} alt={`Zdjęcie ${i + 1}`}
                  className={`h-40 w-40 flex-shrink-0 rounded-xl object-cover border-2 ${i === 0 ? 'border-primary-400' : 'border-gray-200'}`}
                />
              ))}
            </div>
          )}
          {previewImages.length === 0 && (
            <div className="h-40 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
              Brak zdjęć — dodaj je w kroku Zdjęcia
            </div>
          )}

          {/* Title & Price */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.title || 'Brak tytułu'}</h1>
            <div className="flex items-center gap-4 mt-2">
              {data.basePrice ? (
                <span className="text-3xl font-bold text-primary-600">
                  {data.basePrice.toFixed(2)} PLN
                </span>
              ) : (
                <span className="text-gray-400 text-sm">Cena nie ustalona</span>
              )}
              {data.condition && (
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  data.condition === 'NEW' ? 'bg-green-100 text-green-700'
                  : data.condition === 'USED' ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
                }`}>
                  {CONDITION_LABELS[data.condition]}
                </span>
              )}
            </div>
          </div>

          {/* Platforms */}
          {data.selectedPlatforms.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Zostanie opublikowane na</p>
              <div className="flex gap-2 flex-wrap">
                {data.selectedPlatforms.map((p) => (
                  <span key={p} className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${PLATFORM_COLORS[p] ?? 'bg-gray-100 text-gray-700'}`}>
                    <ExternalLink className="h-3 w-3" /> {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Opis</p>
            {data.description ? (
              <div
                className="listing-preview prose max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            ) : (
              <p className="text-gray-400 text-sm italic">Brak opisu — wygeneruj go za pomocą AI lub wpisz ręcznie.</p>
            )}
          </div>

          {/* Available platforms info */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p className="font-medium mb-1">Dostępne platformy dla tej kategorii:</p>
            <p>{platforms.join(' · ')}</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <Button variant="outline" onClick={onClose}>Zamknij podgląd</Button>
        </div>
      </div>
    </div>
  );
}
