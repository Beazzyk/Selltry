import { Check } from 'lucide-react';

const PLATFORM_LIMITS: Record<string, number> = {
  ALLEGRO: 75,
  OLX: 70,
  OTOMOTO: 80,
  OVOKO: 100,
};

const PLATFORM_COLORS: Record<string, string> = {
  ALLEGRO: 'border-orange-200 bg-orange-50 text-orange-800',
  OLX: 'border-lime-200 bg-lime-50 text-lime-800',
  OTOMOTO: 'border-blue-200 bg-blue-50 text-blue-800',
  OVOKO: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

interface Props {
  platformTitles: Record<string, string>;
  currentTitle: string;
  onSelect: (title: string) => void;
}

export function PlatformTitleSuggestions({ platformTitles, currentTitle, onSelect }: Props) {
  const entries = Object.entries(platformTitles).filter(([, t]) => t);
  if (entries.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Tytuły zoptymalizowane per platforma — kliknij żeby użyć
      </p>
      <div className="space-y-1.5">
        {entries.map(([platform, title]) => {
          const limit = PLATFORM_LIMITS[platform] ?? 80;
          const isActive = currentTitle === title;
          const color = PLATFORM_COLORS[platform] ?? 'border-gray-200 bg-gray-50 text-gray-700';

          return (
            <button
              key={platform}
              type="button"
              onClick={() => onSelect(title)}
              className={`w-full text-left rounded-lg border px-3 py-2 text-xs transition-all hover:opacity-90 ${color} ${isActive ? 'ring-2 ring-offset-1 ring-current' : ''}`}
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="font-semibold text-[11px] uppercase tracking-wider">{platform}</span>
                <span className={`text-[10px] font-mono ${title.length > limit ? 'text-red-500 font-bold' : 'opacity-60'}`}>
                  {title.length}/{limit}
                </span>
                {isActive && <Check className="h-3 w-3 flex-shrink-0" />}
              </div>
              <p className="leading-snug">{title}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
