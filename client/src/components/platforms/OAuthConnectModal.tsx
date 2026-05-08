import { useEffect, type MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Platform } from '@/types';

interface OAuthConnectModalProps {
  open: boolean;
  platform: Platform | null;
  isSubmitting: boolean;
  onClose: () => void;
  onContinue: () => Promise<void>;
}

const PLATFORM_LABEL: Partial<Record<Platform, string>> = {
  ALLEGRO: 'Allegro',
  OLX: 'OLX',
  EBAY: 'eBay',
};

export function OAuthConnectModal({
  open,
  platform,
  isSubmitting,
  onClose,
  onContinue,
}: OAuthConnectModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, isSubmitting, onClose]);

  if (!open || !platform) return null;

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !isSubmitting) {
      onClose();
    }
  }

  const platformLabel = PLATFORM_LABEL[platform] ?? platform;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Połącz {platformLabel}</h2>
        <p className="mt-1 text-sm text-gray-500">
          Za chwilę otworzy się okno logowania {platformLabel}. Po zalogowaniu wrócisz automatycznie do aplikacji.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button type="button" onClick={() => void onContinue()} disabled={isSubmitting}>
            {isSubmitting ? 'Otwieram...' : `Kontynuuj do ${platformLabel}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
