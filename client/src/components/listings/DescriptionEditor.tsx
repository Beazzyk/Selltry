import { useRef, useEffect, useState } from 'react';
import { Eye, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (html: string) => void;
  onClear?: () => void;
}

export function DescriptionEditor({ value, onChange, onClear }: Props) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Sync external value changes into contenteditable (e.g. after AI regeneration)
  useEffect(() => {
    if (!editorRef.current) return;
    if (isUpdatingRef.current) return;
    // Only update DOM if the content actually differs to avoid cursor jump
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  function handleInput() {
    if (!editorRef.current) return;
    isUpdatingRef.current = true;
    onChange(editorRef.current.innerHTML);
    isUpdatingRef.current = false;
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              mode === 'edit' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <Pencil className="h-3 w-3" /> Edytuj
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              mode === 'preview' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <Eye className="h-3 w-3" /> Podgląd
          </button>
        </div>
        {onClear && (
          <button type="button" onClick={onClear} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            Usuń i wpisz ręcznie
          </button>
        )}
      </div>

      {/* Edit mode — contenteditable WYSIWYG */}
      <div
        ref={editorRef}
        contentEditable={mode === 'edit'}
        suppressContentEditableWarning
        onInput={handleInput}
        className={cn(
          'listing-preview min-h-[220px] max-h-[420px] overflow-y-auto p-4 text-sm text-gray-800 focus:outline-none',
          mode === 'edit' && 'cursor-text focus:ring-2 focus:ring-inset focus:ring-[rgba(22,61,110,0.25)]',
          mode === 'preview' && 'bg-white',
        )}
        // Initial content set via useEffect
      />

      {mode === 'edit' && (
        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-400">
          Klikaj w tekst i edytuj bezpośrednio — zmiany są zapisywane na bieżąco
        </div>
      )}
    </div>
  );
}
