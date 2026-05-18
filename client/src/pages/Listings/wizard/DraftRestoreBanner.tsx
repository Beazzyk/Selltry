import { RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WizardDraftMeta } from './draftStorage';

interface Props {
  draft: WizardDraftMeta;
  onRestore: () => void;
  onDismiss: () => void;
}

function formatSavedAt(date: Date): string {
  return date.toLocaleString('pl-PL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DraftRestoreBanner({ draft, onRestore, onDismiss }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-amber-900">Masz zapisany szkic</p>
        <p className="mt-0.5 text-xs text-amber-800">
          Ostatni zapis: {formatSavedAt(draft.savedAt)}
          {draft.imagesOmitted && ' (zdjęcia nie zostały zapisane — limit pamięci przeglądarki)'}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button type="button" size="sm" onClick={onRestore}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          Przywróć
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDismiss}>
          <X className="mr-1 h-3.5 w-3.5" />
          Odrzuć
        </Button>
      </div>
    </div>
  );
}
