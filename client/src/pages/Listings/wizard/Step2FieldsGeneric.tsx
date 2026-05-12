import { Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CategoryType } from '@/types';
import { BrandSelect } from '@/components/shared/BrandSelect';
import { useDescriptionGenerator } from '@/hooks/useDescriptionGenerator';
import { WizardData } from './types';

const CONDITION_OPTIONS = [
  { value: 'NEW', label: 'Nowy' },
  { value: 'USED', label: 'Używany' },
  { value: 'DAMAGED', label: 'Uszkodzony' },
];

const TYPE_FIELDS: Record<Exclude<CategoryType, 'AUTOMOTIVE'>, { brand?: boolean; productModel?: boolean; color?: boolean; size?: boolean; material?: boolean; gender?: boolean; warrantyMonths?: boolean }> = {
  ELECTRONICS: { brand: true, productModel: true, color: true, warrantyMonths: true },
  HOME_GARDEN:  { brand: true, productModel: true, color: true, material: true },
  FASHION:      { brand: true, size: true, color: true, material: true, gender: true },
  SPORT:        { brand: true, productModel: true, size: true, color: true },
  TOOLS:        { brand: true, productModel: true },
  OTHER:        { brand: true, productModel: true },
};

interface Props {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}

function patchAttr(data: WizardData, onChange: Props['onChange'], key: string, value: string | number | undefined) {
  onChange({ attributes: { ...data.attributes, [key]: value } });
}

export function Step2FieldsGeneric({ data, onChange }: Props) {
  const { generate, loading: aiLoading, error: aiError } = useDescriptionGenerator();
  const type = data.categoryType as Exclude<CategoryType, 'AUTOMOTIVE'> | undefined;
  const fields = type ? TYPE_FIELDS[type] ?? {} : {};
  const attrs = data.attributes;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.brand && type && (
          <div>
            <Label>Marka</Label>
            <div className="mt-1">
              <BrandSelect
                categoryType={type}
                value={String(attrs.brand ?? '')}
                onChange={(v) => patchAttr(data, onChange, 'brand', v)}
              />
            </div>
          </div>
        )}
        {fields.productModel && (
          <div>
            <Label>Model</Label>
            <Input className="mt-1" placeholder="np. Galaxy S24..." value={attrs.productModel ?? ''} onChange={(e) => patchAttr(data, onChange, 'productModel', e.target.value)} />
          </div>
        )}
        {fields.color && (
          <div>
            <Label>Kolor</Label>
            <Input className="mt-1" placeholder="np. Czarny, Srebrny..." value={attrs.color ?? ''} onChange={(e) => patchAttr(data, onChange, 'color', e.target.value)} />
          </div>
        )}
        {fields.size && (
          <div>
            <Label>Rozmiar</Label>
            <Input className="mt-1" placeholder="np. M, 42, 15 cali..." value={attrs.size ?? ''} onChange={(e) => patchAttr(data, onChange, 'size', e.target.value)} />
          </div>
        )}
        {fields.material && (
          <div>
            <Label>Materiał</Label>
            <Input className="mt-1" placeholder="np. Bawełna, Metal..." value={attrs.material ?? ''} onChange={(e) => patchAttr(data, onChange, 'material', e.target.value)} />
          </div>
        )}
        {fields.warrantyMonths && (
          <div>
            <Label>Gwarancja (miesiące)</Label>
            <Input className="mt-1" type="number" min={0} value={attrs.warrantyMonths ?? ''} onChange={(e) => patchAttr(data, onChange, 'warrantyMonths', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
        )}
        {fields.gender && (
          <div>
            <Label>Przeznaczenie</Label>
            <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={attrs.gender ?? ''} onChange={(e) => patchAttr(data, onChange, 'gender', e.target.value)}>
              <option value="">Wybierz...</option>
              <option value="UNISEX">Unisex</option>
              <option value="MALE">Męskie</option>
              <option value="FEMALE">Damskie</option>
              <option value="KIDS">Dziecięce</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <Label>Stan *</Label>
        <div className="flex gap-2 mt-1">
          {CONDITION_OPTIONS.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => onChange({ condition: value as WizardData['condition'] })}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${data.condition === value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Tytuł ogłoszenia *</Label>
        <Input className="mt-1" placeholder="Krótki, opisowy tytuł..." value={data.title ?? ''} onChange={(e) => onChange({ title: e.target.value })} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label>Opis *</Label>
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
        {data.description && data.description.startsWith('<') ? (
          <div className="mt-1 rounded-md border border-gray-200 p-3 bg-gray-50 text-xs text-gray-500 max-h-40 overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: data.description }} />
          </div>
        ) : (
          <textarea className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[100px]"
            placeholder="Szczegółowy opis produktu lub wygeneruj AI..."
            value={data.description ?? ''} onChange={(e) => onChange({ description: e.target.value })} />
        )}
        {data.description?.startsWith('<') && (
          <button type="button" className="text-xs text-primary-600 hover:underline mt-1"
            onClick={() => onChange({ description: '' })}>
            Wyczyść i wpisz ręcznie
          </button>
        )}
      </div>
    </div>
  );
}
