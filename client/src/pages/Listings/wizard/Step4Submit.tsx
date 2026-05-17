import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WizardData, getPlatformsForCategory } from './types';
import { useQuery } from '@tanstack/react-query';
import { getPlatforms } from '@/api/platforms.api';
import { getMarginRules } from '@/api/margins.api';
import { PlatformCategoryPicker } from './PlatformCategoryPicker';

const CATEGORY_SYNC_PLATFORMS = ['ALLEGRO', 'OLX', 'OTOMOTO'];

interface Props {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}

export function Step4Submit({ data, onChange }: Props) {
  const { data: platforms = [] } = useQuery({ queryKey: ['platforms'], queryFn: getPlatforms });
  const { data: margins = [] } = useQuery({ queryKey: ['margins'], queryFn: getMarginRules });

  const allowedPlatforms = getPlatformsForCategory(data.categoryType);
  const activePlatforms = new Set(
    platforms.filter((p) => p.isActive && allowedPlatforms.includes(p.platform as typeof allowedPlatforms[number])).map((p) => p.platform),
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Cena i ilość</h3>
        <p className="text-sm text-gray-500 mt-1">
          Podaj cenę bazową. Marże per platforma ustawisz w Ustawieniach (Etap 6).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Cena bazowa (PLN) *</Label>
          <div className="relative mt-1">
            <Input
              id="price"
              type="number"
              min={0.01}
              step={0.01}
              placeholder="np. 150.00"
              value={data.basePrice ?? ''}
              onChange={(e) => onChange({ basePrice: e.target.value ? Number(e.target.value) : undefined })}
              className="pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">PLN</span>
          </div>
        </div>

        <div>
          <Label htmlFor="quantity">Ilość sztuk</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            value={data.quantity ?? 1}
            onChange={(e) => onChange({ quantity: e.target.value ? Number(e.target.value) : 1 })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Platformy publikacji</h4>
        {data.categoryType && data.categoryType !== 'AUTOMOTIVE' && (
          <p className="text-xs text-[var(--muted)] bg-[var(--bg-2)] rounded px-3 py-2">
            Otomoto i Ovoko dostępne tylko dla kategorii Motoryzacja.
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {allowedPlatforms.map((platform) => {
            const active = activePlatforms.has(platform);
            const selected = data.selectedPlatforms.includes(platform);
            return (
              <label key={platform} className={`rounded border p-2 text-sm ${active ? 'cursor-pointer' : 'opacity-50'}`}>
                <input
                  type="checkbox"
                  className="mr-2"
                  disabled={!active}
                  checked={selected}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...data.selectedPlatforms, platform]
                      : data.selectedPlatforms.filter((item) => item !== platform);
                    onChange({ selectedPlatforms: next });
                  }}
                />
                {platform}
              </label>
            );
          })}
        </div>
      </div>

      {data.selectedPlatforms.filter((p) => CATEGORY_SYNC_PLATFORMS.includes(p)).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Kategorie na platformach</h4>
          <p className="text-xs text-gray-500">
            Wybierz kategorię na każdej platformie — bez tego ogłoszenie nie zostanie wystawione.
          </p>
          {data.selectedPlatforms
            .filter((p) => CATEGORY_SYNC_PLATFORMS.includes(p))
            .map((platform) => (
              <PlatformCategoryPicker
                key={platform}
                platform={platform}
                selectedExternalId={data.platformCategories[platform]}
                onSelect={(externalId) =>
                  onChange({ platformCategories: { ...data.platformCategories, [platform]: externalId } })
                }
                onClear={() => {
                  const next = { ...data.platformCategories };
                  delete next[platform];
                  onChange({ platformCategories: next });
                }}
              />
            ))}
        </div>
      )}

      {/* Podsumowanie */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Podsumowanie ogłoszenia</h4>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-gray-500">Tytuł</dt>
          <dd className="text-gray-900 truncate">{data.title ?? '—'}</dd>
          <dt className="text-gray-500">Stan</dt>
          <dd className="text-gray-900">{data.condition ?? '—'}</dd>
          <dt className="text-gray-500">Zdjęcia</dt>
          <dd className="text-gray-900">{data.images.length} szt.</dd>
          <dt className="text-gray-500">Cena bazowa</dt>
          <dd className="text-gray-900 font-semibold">
            {data.basePrice ? `${data.basePrice.toFixed(2)} PLN` : '—'}
          </dd>
        </dl>
      </div>

      <p className="text-xs text-gray-400">
        {data.selectedPlatforms.length > 0
          ? 'Kliknij „Wystawiaj" — ogłoszenie trafi do kolejki publikacji na wybranych platformach.'
          : 'Nie wybrałeś platform — ogłoszenie zostanie zapisane jako szkic. Możesz je wystawić później z listy ogłoszeń.'}
      </p>

      {data.basePrice && data.selectedPlatforms.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Podglad cen koncowych</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {data.selectedPlatforms.map((platform) => {
              const basePrice = data.basePrice ?? 0;
              const rule = margins.find((item) => item.platform === platform);
              const finalPrice = !rule
                ? basePrice
                : rule.marginType === 'PERCENTAGE'
                  ? basePrice * (1 + rule.marginValue / 100)
                  : basePrice + rule.marginValue;
              return (
                <p key={platform}>
                  {platform}: {basePrice.toFixed(2)} PLN -&gt; {finalPrice.toFixed(2)} PLN
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
