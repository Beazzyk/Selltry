import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { getMarginRules, saveMarginRules } from '@/api/margins.api';
import { MarginRule, Platform } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

const PLATFORM_META: Record<Platform, { label: string; bg: string; initials: string }> = {
  ALLEGRO: { label: 'Allegro', bg: 'bg-orange-500', initials: 'AL' },
  OVOKO: { label: 'Ovoko', bg: 'bg-emerald-600', initials: 'OV' },
  OTOMOTO: { label: 'Otomoto', bg: 'bg-blue-600', initials: 'OT' },
  OLX: { label: 'OLX', bg: 'bg-lime-500', initials: 'OLX' },
  EBAY: { label: 'eBay', bg: 'bg-yellow-400', initials: 'eB' },
};

const PLATFORMS: Platform[] = ['ALLEGRO', 'OVOKO', 'OTOMOTO', 'OLX', 'EBAY'];

export default function MarginsSection() {
  const { data = [] } = useQuery({ queryKey: ['margins'], queryFn: getMarginRules });
  const [rules, setRules] = useState<Omit<MarginRule, 'id'>[]>([]);
  const debounced = useDebounce(rules, 500);
  const { mutate: saveRules } = useMutation({ mutationFn: saveMarginRules });

  useEffect(() => {
    if (!data.length) {
      setRules(PLATFORMS.map((platform) => ({ platform, marginType: 'PERCENTAGE', marginValue: 0 })));
      return;
    }
    setRules(data.map(({ id: _id, ...rest }) => rest));
  }, [data]);

  useEffect(() => {
    if (debounced.length > 0) saveRules(debounced);
  }, [debounced, saveRules]);

  const byPlatform = useMemo(
    () => Object.fromEntries(rules.map((r) => [r.platform, r])) as Record<Platform, Omit<MarginRule, 'id'>>,
    [rules],
  );

  function setType(platform: Platform, marginType: 'PERCENTAGE' | 'FIXED_AMOUNT') {
    setRules((prev) => prev.map((r) => (r.platform === platform ? { ...r, marginType } : r)));
  }

  function setValue(platform: Platform, marginValue: number) {
    setRules((prev) => prev.map((r) => (r.platform === platform ? { ...r, marginValue } : r)));
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {PLATFORMS.map((platform) => {
        const meta = PLATFORM_META[platform];
        const rule = byPlatform[platform] ?? { platform, marginType: 'PERCENTAGE', marginValue: 0 };
        const preview =
          rule.marginType === 'PERCENTAGE' ? 100 * (1 + rule.marginValue / 100) : 100 + rule.marginValue;

        return (
          <div key={platform} className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-4 shadow-sm gap-3 transition-shadow hover:shadow-md">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${meta.bg} text-white font-bold text-sm select-none`}>
              {meta.initials}
            </div>
            <p className="font-semibold text-gray-900 text-sm">{meta.label}</p>

            <div className="flex w-full overflow-hidden rounded-lg border border-gray-200 text-xs font-medium">
              <button
                type="button"
                className={`flex-1 py-1.5 transition-colors ${rule.marginType === 'PERCENTAGE' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setType(platform, 'PERCENTAGE')}
              >
                %
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 transition-colors ${rule.marginType === 'FIXED_AMOUNT' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setType(platform, 'FIXED_AMOUNT')}
              >
                PLN
              </button>
            </div>

            <Input
              type="number"
              className="text-center text-sm"
              value={rule.marginValue}
              onChange={(e) => setValue(platform, Number(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-400 text-center">100 → {preview.toFixed(2)} PLN</p>
          </div>
        );
      })}
    </div>
  );
}
