import { useQuery } from '@tanstack/react-query';
import { getBrands } from '@/api/categories.api';
import { CategoryType } from '@/types';

interface Props {
  categoryType: CategoryType;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function BrandSelect({ categoryType, value, onChange, placeholder = 'Wpisz lub wybierz markę...' }: Props) {
  const listId = `brand-list-${categoryType}`;

  const { data: brands = [] } = useQuery({
    queryKey: ['brands', categoryType],
    queryFn: () => getBrands(categoryType),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div>
      <input
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]"
      />
      <datalist id={listId}>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.name} />
        ))}
      </datalist>
    </div>
  );
}
