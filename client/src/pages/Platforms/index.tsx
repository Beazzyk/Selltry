import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Plug, Unplug, FlaskConical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  connectPlatform,
  disconnectPlatform,
  getAllegroOAuthStart,
  getOlxOAuthStart,
  getPlatforms,
  testPlatform,
} from '@/api/platforms.api';
import { Platform } from '@/types';
import { useToast } from '@/components/ui/toast';

const PLATFORM_META: Record<Platform, { label: string; bg: string; initials: string; oauth: boolean }> = {
  ALLEGRO: { label: 'Allegro', bg: 'bg-orange-500', initials: 'AL', oauth: true },
  OVOKO: { label: 'Ovoko', bg: 'bg-emerald-600', initials: 'OV', oauth: false },
  OTOMOTO: { label: 'Otomoto', bg: 'bg-blue-600', initials: 'OT', oauth: false },
  OLX: { label: 'OLX', bg: 'bg-lime-500', initials: 'OLX', oauth: true },
  EBAY: { label: 'eBay', bg: 'bg-yellow-400', initials: 'eB', oauth: false },
};

const PLATFORMS: Platform[] = ['ALLEGRO', 'OVOKO', 'OTOMOTO', 'OLX', 'EBAY'];

function openOAuthPopup(url: string): void {
  const w = 600, h = 700;
  const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - h) / 2);
  window.open(url, 'oauth_popup', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);
}

export default function PlatformsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data = [] } = useQuery({ queryKey: ['platforms'], queryFn: getPlatforms });

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      const d = e.data;
      if (d?.type !== 'OAUTH_CONNECTED') return;
      if (d.status === 'success') {
        queryClient.invalidateQueries({ queryKey: ['platforms'] });
        toast(`${d.platform} połączona pomyślnie!`, 'success');
      } else {
        toast(`Błąd połączenia ${d.platform}`, 'error');
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient, toast]);

  const connectMut = useMutation({
    mutationFn: connectPlatform,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platforms'] }),
    onError: () => toast('Nie udało się połączyć platformy', 'error'),
  });
  const disconnectMut = useMutation({
    mutationFn: disconnectPlatform,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platforms'] }),
    onError: () => toast('Nie udało się rozłączyć platformy', 'error'),
  });
  const testMut = useMutation({
    mutationFn: testPlatform,
    onSuccess: (r) => toast(r.message, 'success'),
    onError: () => toast('Test połączenia nie powiódł się', 'error'),
  });

  async function handleConnect(platform: Platform) {
    if (platform === 'ALLEGRO') {
      try {
        const { authorizationUrl } = await getAllegroOAuthStart();
        openOAuthPopup(authorizationUrl);
      } catch {
        toast('Nie udało się uruchomić OAuth Allegro', 'error');
      }
      return;
    }
    if (platform === 'OLX') {
      try {
        const result = await getOlxOAuthStart();
        if (result?.authorizationUrl) {
          openOAuthPopup(result.authorizationUrl);
        } else {
          queryClient.invalidateQueries({ queryKey: ['platforms'] });
          toast('OLX połączona (MOCK)', 'success');
        }
      } catch {
        toast('Nie udało się uruchomić OAuth OLX', 'error');
      }
      return;
    }
    connectMut.mutate(platform);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platformy sprzedaży</h1>
        <p className="text-sm text-gray-500 mt-1">Połącz swoje konta sprzedawcy z każdą platformą</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {PLATFORMS.map((platform) => {
          const meta = PLATFORM_META[platform];
          const current = data.find((item) => item.platform === platform);
          const active = !!current?.isActive;
          const isTesting = testMut.isPending && testMut.variables === platform;

          return (
            <div
              key={platform}
              className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-5 shadow-sm gap-4 transition-shadow hover:shadow-md"
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${meta.bg} text-white font-bold text-lg select-none`}>
                {meta.initials}
              </div>

              <div className="text-center">
                <p className="font-semibold text-gray-900">{meta.label}</p>
                <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 ${active ? 'text-green-600' : 'text-gray-400'}`}>
                  {active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {active ? 'Połączona' : 'Niepołączona'}
                </span>
              </div>

              <div className="flex flex-col gap-2 w-full mt-auto">
                {active ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => testMut.mutate(platform)}
                      disabled={isTesting}
                    >
                      {isTesting ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <FlaskConical className="h-3 w-3 mr-1" />}
                      {isTesting ? 'Testuje...' : 'Test'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => disconnectMut.mutate(platform)}
                      disabled={disconnectMut.isPending}
                    >
                      <Unplug className="h-3 w-3 mr-1" />
                      Rozłącz
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => void handleConnect(platform)}
                    disabled={connectMut.isPending}
                  >
                    <Plug className="h-3 w-3 mr-1" />
                    Połącz
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400">
        Tokeny dostępowe są szyfrowane AES-256 i przechowywane wyłącznie po stronie serwera.
      </p>
    </div>
  );
}
