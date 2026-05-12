import { useQuery } from '@tanstack/react-query';
import { Car, Cpu, Home, Shirt, Dumbbell, Wrench, Package } from 'lucide-react';
import { getCategories } from '@/api/categories.api';
import { CategoryType } from '@/types';
import { cn } from '@/lib/utils';
import { WizardData } from './types';

const CATEGORY_TILES: { type: CategoryType; label: string; icon: React.ElementType; color: string }[] = [
  { type: 'AUTOMOTIVE',  label: 'Motoryzacja',   icon: Car,      color: 'border-orange-200 bg-orange-50 hover:bg-orange-100 data-[selected]:bg-orange-100 data-[selected]:border-orange-400' },
  { type: 'ELECTRONICS', label: 'Elektronika',   icon: Cpu,      color: 'border-blue-200 bg-blue-50 hover:bg-blue-100 data-[selected]:bg-blue-100 data-[selected]:border-blue-400' },
  { type: 'HOME_GARDEN', label: 'Dom i ogród',   icon: Home,     color: 'border-green-200 bg-green-50 hover:bg-green-100 data-[selected]:bg-green-100 data-[selected]:border-green-400' },
  { type: 'FASHION',     label: 'Moda',          icon: Shirt,    color: 'border-pink-200 bg-pink-50 hover:bg-pink-100 data-[selected]:bg-pink-100 data-[selected]:border-pink-400' },
  { type: 'SPORT',       label: 'Sport',         icon: Dumbbell, color: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100 data-[selected]:bg-yellow-100 data-[selected]:border-yellow-400' },
  { type: 'TOOLS',       label: 'Narzędzia',     icon: Wrench,   color: 'border-gray-200 bg-gray-50 hover:bg-gray-100 data-[selected]:bg-gray-100 data-[selected]:border-gray-400' },
  { type: 'OTHER',       label: 'Inne',          icon: Package,  color: 'border-purple-200 bg-purple-50 hover:bg-purple-100 data-[selected]:bg-purple-100 data-[selected]:border-purple-400' },
];

interface Props {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}

export function Step1Category({ data, onChange }: Props) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', data.categoryType],
    queryFn: () => getCategories(data.categoryType),
    enabled: !!data.categoryType,
  });

  const subcategories = categories.flatMap((root) => root.children ?? []);

  function selectType(type: CategoryType) {
    onChange({ categoryType: type, categoryId: undefined });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Wybierz typ kategorii</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORY_TILES.map(({ type, label, icon: Icon, color }) => (
            <button
              key={type}
              type="button"
              data-selected={data.categoryType === type ? '' : undefined}
              onClick={() => selectType(type)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all',
                color,
              )}
            >
              <Icon className="h-6 w-6" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {data.categoryType && subcategories.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Podkategoria *</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {subcategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange({ categoryId: cat.id })}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm text-left transition-colors',
                  data.categoryId === cat.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700',
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {data.categoryType && subcategories.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 text-center">
          Ładowanie podkategorii...
        </div>
      )}
    </div>
  );
}
