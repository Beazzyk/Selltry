import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OtomotoConnectModalProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (username: string, password: string) => Promise<void>;
}

export function OtomotoConnectModal({
  open,
  isSubmitting,
  onClose,
  onSubmit,
}: OtomotoConnectModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!open) {
      setUsername('');
      setPassword('');
      return;
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, isSubmitting, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit(username.trim(), password);
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !isSubmitting) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Połącz Otomoto</h2>
        <p className="mt-1 text-sm text-gray-500">Podaj dane konta Otomoto Business.</p>

        <form className="mt-4 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
          <div className="space-y-1.5">
            <Label htmlFor="otomoto-username">Email / login</Label>
            <Input
              id="otomoto-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="twoj@email.pl"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="otomoto-password">Hasło</Label>
            <Input
              id="otomoto-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting || !username.trim() || !password}>
              {isSubmitting ? 'Łączenie...' : 'Połącz Otomoto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
