import { Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WizardData } from './types';
import { Condition } from '@/types';
import { useDescriptionGenerator } from '@/hooks/useDescriptionGenerator';
import { PlatformTitleSuggestions } from '@/components/listings/PlatformTitleSuggestions';
import { DescriptionEditor } from '@/components/listings/DescriptionEditor';

interface Props {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}

const CONDITIONS: { value: Condition; label: string; desc: string }[] = [
  { value: 'NEW', label: 'Nowy', desc: 'Nieużywany, w oryginalnym opakowaniu' },
  { value: 'USED', label: 'Używany', desc: 'Sprawny, ślady użytkowania' },
  { value: 'DAMAGED', label: 'Uszkodzony', desc: 'Wymaga naprawy lub na części' },
];

const PART_SIDES = ['Lewa', 'Prawa', 'Nie dotyczy'];

export function Step2Details({ data, onChange }: Props) {
  const { generate, loading: aiLoading, error: aiError } = useDescriptionGenerator();

  function autoGenerateTitle() {
    const parts: string[] = [];
    if (data.partSide && data.partSide !== 'Nie dotyczy') parts.push(data.partSide.toLowerCase());
    if (data.condition === 'USED') parts.push('używana');
    if (data.condition === 'DAMAGED') parts.push('uszkodzona');
    if (parts.length) onChange({ title: parts.join(' ') });
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-2 block">Strona montażu</Label>
        <div className="flex gap-2">
          {PART_SIDES.map((side) => (
            <button key={side} type="button" onClick={() => onChange({ partSide: side })}
              className={cn('px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                data.partSide === side ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
              )}>
              {side}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-2 block">Stan</Label>
        <div className="grid grid-cols-3 gap-3">
          {CONDITIONS.map(({ value, label, desc }) => (
            <button key={value} type="button" onClick={() => onChange({ condition: value })}
              className={cn('rounded-xl border p-3 text-left transition-colors',
                data.condition === value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:bg-gray-50',
              )}>
              <p className={cn('text-sm font-semibold', data.condition === value ? 'text-primary-700' : 'text-gray-900')}>{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {data.condition === 'DAMAGED' && (
        <div>
          <Label htmlFor="damage">Opis uszkodzeń</Label>
          <textarea id="damage" rows={3} placeholder="Opisz szczegółowo uszkodzenia..."
            value={data.damageDescription ?? ''}
            onChange={(e) => onChange({ damageDescription: e.target.value || undefined })}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label htmlFor="title">Tytuł ogłoszenia *</Label>
          <button type="button" onClick={autoGenerateTitle} className="text-xs text-primary-600 hover:underline">
            Generuj automatycznie
          </button>
        </div>
        <Input id="title" placeholder="np. Lampa tylna Suzuki Samurai 1990 prawa"
          value={data.title ?? ''} onChange={(e) => onChange({ title: e.target.value || undefined })} maxLength={200} />
        <p className="text-xs text-gray-400 mt-1 text-right">{(data.title ?? '').length}/200</p>
        {data.platformTitles && (
          <PlatformTitleSuggestions
            platformTitles={data.platformTitles}
            currentTitle={data.title ?? ''}
            onSelect={(t) => onChange({ title: t })}
          />
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label htmlFor="description">Opis *</Label>
          <Button type="button" size="sm" variant="outline"
            onClick={() => void generate(data, onChange)}
            disabled={aiLoading || !data.title || !data.condition}
            className="gap-1.5 text-primary-600 border-primary-200 hover:bg-primary-50"
          >
            {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {aiLoading ? 'Generuję...' : 'Generuj z AI'}
          </Button>
        </div>
        {aiError && <p className="text-xs text-red-500 mb-1">{aiError}</p>}
        {data.description?.startsWith('<') ? (
          <DescriptionEditor
            value={data.description}
            onChange={(html) => onChange({ description: html })}
            onClear={() => onChange({ description: undefined })}
          />
        ) : (
          <>
            <textarea id="description" rows={5} placeholder="Opisz część, jej stan, pasujące pojazdy lub wygeneruj AI..."
              value={data.description ?? ''}
              onChange={(e) => onChange({ description: e.target.value || undefined })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className={cn('text-xs mt-1 text-right', (data.description?.length ?? 0) < 10 ? 'text-red-400' : 'text-gray-400')}>
              {data.description?.length ?? 0} znaków
            </p>
          </>
        )}
      </div>

      <div>
        <Label htmlFor="partDetails">Dodatkowe informacje (opcjonalne)</Label>
        <Input id="partDetails" placeholder="np. z wiązką, bez osprzętu"
          value={data.partDetails ?? ''}
          onChange={(e) => onChange({ partDetails: e.target.value || undefined })}
          className="mt-1"
        />
      </div>
    </div>
  );
}
