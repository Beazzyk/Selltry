import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Plug, Unplug, FlaskConical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  connectPlatform,
  connectOtomoto,
  disconnectPlatform,
  getAllegroOAuthStart,
  getOlxOAuthStart,
  getPlatforms,
  testPlatform,
} from '@/api/platforms.api';
import { Platform } from '@/types';
import { useToast } from '@/components/ui/toast';
import { OtomotoConnectModal } from '@/components/platforms/OtomotoConnectModal';
import { OAuthConnectModal } from '@/components/platforms/OAuthConnectModal';
import { PlatformDiagnosticsPanel } from '@/components/platforms/PlatformDiagnosticsPanel';
import { usePlatformDiagnostics } from '@/hooks/usePlatformDiagnostics';
import { getRequestErrorMessage } from '@/lib/errors';

type ActivePlatform = Exclude<Platform, 'EBAY'>;

const PLATFORM_META: Record<ActivePlatform, { label: string; bg: string; initials: string; comingSoon?: boolean; comingSoonNote?: string }> = {
  ALLEGRO: { label: 'Allegro', bg: 'bg-orange-500', initials: 'AL' },
  OLX:     { label: 'OLX',     bg: 'bg-lime-500',   initials: 'OLX' },
  OTOMOTO: { label: 'Otomoto', bg: 'bg-[var(--pf-otomoto)]', initials: 'OT', comingSoon: true, comingSoonNote: 'Wymaga umowy partnerskiej z OLX Group' },
  OVOKO:   { label: 'Ovoko',   bg: 'bg-emerald-600', initials: 'OV', comingSoon: true, comingSoonNote: 'Integracja w przygotowaniu' },
};

const PLATFORMS: ActivePlatform[] = ['ALLEGRO', 'OVOKO', 'OTOMOTO', 'OLX'];
const OAUTH_PLATFORMS: ActivePlatform[] = ['ALLEGRO', 'OLX'];

function openOAuthPopup(): Window | null {
  const w = 600, h = 700;
  const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - h) / 2);
  // Otwieramy synchronicznie przed await — przeglądarka traktuje to jako user gesture
  return window.open('about:blank', 'oauth_popup', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);
}

export default function PlatformsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data = [] } = useQuery({ queryKey: ['platforms'], queryFn: getPlatforms });
  const diagnostics = usePlatformDiagnostics();
  const [isOtomotoModalOpen, setIsOtomotoModalOpen] = useState(false);
  const [oauthPlatform, setOauthPlatform] = useState<Platform | null>(null);
  const [isOAuthConnecting, setIsOAuthConnecting] = useState(false);

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
  const otomotoConnectMut = useMutation({
    mutationFn: (creds: { username: string; password: string }) => connectOtomoto(creds.username, creds.password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      setIsOtomotoModalOpen(false);
      toast('Otomoto połączona pomyślnie!', 'success');
    },
    onError: (error) => toast(getRequestErrorMessage(error, 'Nie udało się połączyć Otomoto'), 'error'),
  });

  async function startOAuthConnect(platform: Platform) {
    const popup = openOAuthPopup();
    try {
      if (platform === 'ALLEGRO') {
        const { authorizationUrl } = await getAllegroOAuthStart();
        if (popup) popup.location.href = authorizationUrl;
        else window.location.href = authorizationUrl;
      } else if (platform === 'OLX') {
        const result = await getOlxOAuthStart();
        if (result?.authorizationUrl) {
          if (popup) popup.location.href = result.authorizationUrl;
          else window.location.href = result.authorizationUrl;
        } else {
          popup?.close();
          queryClient.invalidateQueries({ queryKey: ['platforms'] });
          toast('OLX połączona (MOCK)', 'success');
        }
      }
    } catch (error) {
      popup?.close();
      toast(getRequestErrorMessage(error, `Nie udało się uruchomić OAuth ${platform}`), 'error');
    }
  }

  function handleConnect(platform: ActivePlatform) {
    if (OAUTH_PLATFORMS.includes(platform)) {
      setOauthPlatform(platform);
      return;
    }
    if (platform === 'OTOMOTO') {
      setIsOtomotoModalOpen(true);
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
          const active = !!data.find((item) => item.platform === platform)?.isActive;
          const isTesting = testMut.isPending && testMut.variables === platform;

          if (meta.comingSoon) {
            return (
              <div key={platform} className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-5 gap-4 opacity-70">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${meta.bg} text-white font-bold text-lg select-none opacity-60`}>
                  {meta.initials}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-700">{meta.label}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium mt-1 text-amber-600">
                    Wkrótce
                  </span>
                  {meta.comingSoonNote && (
                    <p className="text-[10px] text-gray-400 mt-1 leading-tight">{meta.comingSoonNote}</p>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={platform} className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-5 shadow-sm gap-4 transition-shadow hover:shadow-md">
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
                    <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => testMut.mutate(platform)} disabled={isTesting}>
                      {isTesting ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <FlaskConical className="h-3 w-3 mr-1" />}
                      {isTesting ? 'Testuje...' : 'Test'}
                    </Button>
                    <Button size="sm" variant="ghost" className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => disconnectMut.mutate(platform)} disabled={disconnectMut.isPending}>
                      <Unplug className="h-3 w-3 mr-1" />
                      Rozłącz
                    </Button>
                    <PlatformDiagnosticsPanel platform={platform} diagnostics={diagnostics} />
                  </>
                ) : (
                  <Button size="sm" className="w-full text-xs" onClick={() => handleConnect(platform)} disabled={connectMut.isPending}>
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
      <OtomotoConnectModal
        open={isOtomotoModalOpen}
        isSubmitting={otomotoConnectMut.isPending}
        onClose={() => setIsOtomotoModalOpen(false)}
        onSubmit={async (username, password) => {
          await otomotoConnectMut.mutateAsync({ username, password });
        }}
      />
      <OAuthConnectModal
        open={!!oauthPlatform}
        platform={oauthPlatform}
        isSubmitting={isOAuthConnecting}
        onClose={() => { if (!isOAuthConnecting) setOauthPlatform(null); }}
        onContinue={async () => {
          if (!oauthPlatform) return;
          setIsOAuthConnecting(true);
          try {
            await startOAuthConnect(oauthPlatform);
          } finally {
            setIsOAuthConnecting(false);
            setOauthPlatform(null);
          }
        }}
      />
    </div>
  );
}
