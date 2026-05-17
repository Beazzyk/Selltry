import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, AlertTriangle, CheckCircle2, ChevronRight, X } from 'lucide-react';
import {
  searchPlatformCategories,
  getPlatformSyncStatus,
  getPlatformCategoryBreadcrumb,
  PlatformCategoryNode,
} from '@/api/categories.api';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

const PLATFORM_LABEL: Record<string, string> = {
  ALLEGRO: 'Allegro',
  OLX: 'OLX',
  OTOMOTO: 'Otomoto',
};

interface Props {
  platform: string;
  selectedExternalId?: string;
  onSelect: (externalId: string) => void;
  onClear: () => void;
}

export function PlatformCategoryPicker({ platform, selectedExternalId, onSelect, onClear }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const label = PLATFORM_LABEL[platform] ?? platform;
  const debouncedQuery = useDebounce(query, 300);

  const { data: syncStatus } = useQuery({
    queryKey: ['platform-sync-status', platform],
    queryFn: () => getPlatformSyncStatus(platform),
    staleTime: 60_000,
  });

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['platform-category-search', platform, debouncedQuery],
    queryFn: () => searchPlatformCategories(platform, debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  const { data: breadcrumb = [] } = useQuery({
    queryKey: ['platform-category-breadcrumb', platform, selectedExternalId],
    queryFn: () => getPlatformCategoryBreadcrumb(platform, selectedExternalId!),
    enabled: !!selectedExternalId,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const noCategories = syncStatus && syncStatus.supported && syncStatus.count === 0;

  function handleSelect(node: PlatformCategoryNode) {
    onSelect(node.externalId);
    setQuery('');
    setOpen(false);
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-gray-700">
        Kategoria na {label} <span className="text-red-500">*</span>
      </p>

      {noCategories && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Kategorie {label} nie są zsynchronizowane. Zsynchronizuj je w{' '}
            <strong>Ustawieniach</strong> przed wystawianiem.
          </span>
        </div>
      )}

      {selectedExternalId ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
          <span className="flex-1 text-xs text-gray-700">
            {breadcrumb.length > 0 ? (
              <span className="flex flex-wrap items-center gap-0.5">
                {breadcrumb.map((node, i) => (
                  <span key={node.externalId} className="flex items-center gap-0.5">
                    {i > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
                    <span className={i === breadcrumb.length - 1 ? 'font-medium text-gray-900' : 'text-gray-500'}>
                      {node.name}
                    </span>
                  </span>
                ))}
              </span>
            ) : (
              <span className="font-medium text-gray-900">ID: {selectedExternalId}</span>
            )}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-green-100 hover:text-gray-600"
            aria-label="Usuń wybór"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div ref={containerRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder={`Szukaj kategorii ${label}...`}
              disabled={noCategories ?? false}
              className={cn(
                'w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none',
                'placeholder:text-gray-400 focus:border-[var(--navy)] focus:ring-1 focus:ring-[var(--navy)]',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            />
            {isFetching && (
              <div className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-[var(--navy)] border-t-transparent" />
            )}
          </div>

          {open && debouncedQuery.length >= 2 && (
            <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {results.length === 0 && !isFetching ? (
                <p className="px-4 py-3 text-xs text-gray-500">Brak wyników dla &ldquo;{query}&rdquo;</p>
              ) : (
                results.map((node) => (
                  <button
                    key={node.externalId}
                    type="button"
                    onClick={() => handleSelect(node)}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <span className="truncate text-gray-800">{node.name}</span>
                    {node.isLeaf && (
                      <span className="ml-2 shrink-0 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                        liść
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
