import { useEffect, useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Plug, Unplug, FlaskConical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  connectPlatform,
  connectOtomoto,
  disconnectPlatform,
  getAllegroOAuthStart,
  getEbayFulfillmentPolicies,
  getEbayOAuthStart,
  getEbayOffers,
  getEbayPaymentPolicies,
  getEbayReturnPolicies,
  getOlxAdverts,
  getOlxCategoryAttributes,
  getOlxDeliverySettings,
  getOlxOAuthStart,
  getPlatforms,
  getOtomotoAdverts,
  getOtomotoCategory,
  testPlatform,
} from '@/api/platforms.api';
import { Platform } from '@/types';
import { useToast } from '@/components/ui/toast';
import { OtomotoConnectModal } from '@/components/platforms/OtomotoConnectModal';
import { OAuthConnectModal } from '@/components/platforms/OAuthConnectModal';

const PLATFORM_META: Record<Platform, { label: string; bg: string; initials: string; oauth: boolean }> = {
  ALLEGRO: { label: 'Allegro', bg: 'bg-orange-500', initials: 'AL', oauth: true },
  OVOKO: { label: 'Ovoko', bg: 'bg-emerald-600', initials: 'OV', oauth: false },
  OTOMOTO: { label: 'Otomoto', bg: 'bg-blue-600', initials: 'OT', oauth: true },
  OLX: { label: 'OLX', bg: 'bg-lime-500', initials: 'OLX', oauth: true },
  EBAY: { label: 'eBay', bg: 'bg-yellow-400', initials: 'eB', oauth: true },
};

const PLATFORMS: Platform[] = ['ALLEGRO', 'OVOKO', 'OTOMOTO', 'OLX', 'EBAY'];

function openOAuthPopup(): Window | null {
  const w = 600, h = 700;
  const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - h) / 2);
  // Otwieramy okno synchronicznie (przed await) żeby przeglądarka traktowała to jako user gesture
  return window.open('about:blank', 'oauth_popup', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);
}

export default function PlatformsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data = [] } = useQuery({ queryKey: ['platforms'], queryFn: getPlatforms });
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
  const olxDeliveryMut = useMutation({
    mutationFn: getOlxDeliverySettings,
    onSuccess: (response) => {
      const count = Array.isArray(response.data) ? response.data.length : 0;
      toast(`OLX delivery settings: ${count} rekordów`, 'success');
    },
    onError: (error) => toast(getRequestErrorMessage(error, 'Nie udało się pobrać OLX delivery settings'), 'error'),
  });
  const olxAdvertsMut = useMutation({
    mutationFn: getOlxAdverts,
    onSuccess: (response) => {
      const count = Array.isArray(response.data) ? response.data.length : 0;
      toast(`OLX adverts: ${count} rekordów`, 'success');
    },
    onError: (error) => toast(getRequestErrorMessage(error, 'Nie udało się pobrać OLX adverts'), 'error'),
  });
  const olxCategoryAttrsMut = useMutation({
    mutationFn: () => getOlxCategoryAttributes('1459'),
    onSuccess: (response) => {
      const count = Array.isArray(response.data) ? response.data.length : 0;
      toast(`OLX category attributes (1459): ${count} rekordów`, 'success');
    },
    onError: (error) => toast(getRequestErrorMessage(error, 'Nie udało się pobrać OLX category attributes'), 'error'),
  });
  const ebayFulfillmentMut = useMutation({
    mutationFn: () => getEbayFulfillmentPolicies('EBAY_US'),
    onSuccess: (response) => {
      const count = Array.isArray(response.fulfillmentPolicies) ? response.fulfillmentPolicies.length : 0;
      toast(`eBay fulfillment policies: ${count} rekordów`, 'success');
    },
    onError: (error) => toast(getRequestErrorMessage(error, 'Nie udało się pobrać eBay fulfillment policies'), 'error'),
  });
  const ebayPaymentMut = useMutation({
    mutationFn: () => getEbayPaymentPolicies('EBAY_US'),
    onSuccess: (response) => {
      const count = Array.isArray(response.paymentPolicies) ? response.paymentPolicies.length : 0;
      toast(`eBay payment policies: ${count} rekordów`, 'success');
    },
    onError: (error) => toast(getRequestErrorMessage(error, 'Nie udało się pobrać eBay payment policies'), 'error'),
  });
  const ebayReturnMut = useMutation({
    mutationFn: () => getEbayReturnPolicies('EBAY_US'),
    onSuccess: (response) => {
      const count = Array.isArray(response.returnPolicies) ? response.returnPolicies.length : 0;
      toast(`eBay return policies: ${count} rekordów`, 'success');
    },
    onError: (error) => toast(getRequestErrorMessage(error, 'Nie udało się pobrać eBay return policies'), 'error'),
  });
  const ebayOffersMut = useMutation({
    mutationFn: getEbayOffers,
    onSuccess: (response) => {
      const count = Array.isArray(response.offers) ? response.offers.length : 0;
      toast(`eBay offers: ${count} rekordów`, 'success');
    },
    onError: (error) => toast(getRequestErrorMessage(error, 'Nie udało się pobrać eBay offers'), 'error'),
  });
  const otomotoCategoryMut = useMutation({
    mutationFn: () => getOtomotoCategory('29'),
    onSuccess: (response) => {
      toast(`Otomoto category: ${String(response.name ?? response.id ?? 'OK')}`, 'success');
    },
    onError: (error) => toast(getRequestErrorMessage(error, 'Nie udało się pobrać kategorii Otomoto'), 'error'),
  });
  const otomotoAdvertsMut = useMutation({
    mutationFn: getOtomotoAdverts,
    onSuccess: (response) => {
      const count = Array.isArray(response.data) ? response.data.length : 0;
      toast(`Otomoto adverts: ${count} rekordów`, 'success');
    },
    onError: (error) => toast(getRequestErrorMessage(error, 'Nie udało się pobrać Otomoto adverts'), 'error'),
  });
  const otomotoConnectMut = useMutation({
    mutationFn: (credentials: { username: string; password: string }) =>
      connectOtomoto(credentials.username, credentials.password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      setIsOtomotoModalOpen(false);
      toast('Otomoto połączona pomyślnie!', 'success');
    },
    onError: (error) => toast(getRequestErrorMessage(error, 'Nie udało się połączyć Otomoto'), 'error'),
  });

  async function startOAuthConnect(platform: Platform) {
    if (platform === 'ALLEGRO') {
      const popup = openOAuthPopup(); // synchronicznie — przed await
      try {
        const { authorizationUrl } = await getAllegroOAuthStart();
        if (popup) {
          popup.location.href = authorizationUrl;
        } else {
          window.location.href = authorizationUrl;
        }
      } catch (error) {
        popup?.close();
        toast(getRequestErrorMessage(error, 'Nie udało się uruchomić OAuth Allegro'), 'error');
      }
      return;
    }
    if (platform === 'OLX') {
      const popup = openOAuthPopup();
      try {
        const result = await getOlxOAuthStart();
        if (result?.authorizationUrl) {
          if (popup) popup.location.href = result.authorizationUrl;
          else window.location.href = result.authorizationUrl;
        } else {
          popup?.close();
          queryClient.invalidateQueries({ queryKey: ['platforms'] });
          toast('OLX połączona (MOCK)', 'success');
        }
      } catch (error) {
        popup?.close();
        toast(getRequestErrorMessage(error, 'Nie udało się uruchomić OAuth OLX'), 'error');
      }
      return;
    }
    if (platform === 'EBAY') {
      const popup = openOAuthPopup();
      try {
        const { authorizationUrl } = await getEbayOAuthStart();
        if (popup) popup.location.href = authorizationUrl;
        else window.location.href = authorizationUrl;
      } catch (error) {
        popup?.close();
        toast(getRequestErrorMessage(error, 'Nie udało się uruchomić OAuth eBay'), 'error');
      }
      return;
    }
  }

  async function handleConnect(platform: Platform) {
    if (platform === 'ALLEGRO' || platform === 'OLX' || platform === 'EBAY') {
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
                    {platform === 'OLX' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => olxDeliveryMut.mutate()}
                          disabled={olxDeliveryMut.isPending}
                        >
                          {olxDeliveryMut.isPending ? 'Pobieram delivery...' : 'OLX Delivery'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => olxCategoryAttrsMut.mutate()}
                          disabled={olxCategoryAttrsMut.isPending}
                        >
                          {olxCategoryAttrsMut.isPending ? 'Pobieram atrybuty...' : 'OLX Attributes'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => olxAdvertsMut.mutate()}
                          disabled={olxAdvertsMut.isPending}
                        >
                          {olxAdvertsMut.isPending ? 'Pobieram adverts...' : 'OLX Adverts'}
                        </Button>
                      </>
                    )}
                    {platform === 'EBAY' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => ebayFulfillmentMut.mutate()}
                          disabled={ebayFulfillmentMut.isPending}
                        >
                          {ebayFulfillmentMut.isPending ? 'Pobieram fulfillment...' : 'eBay Fulfillment'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => ebayPaymentMut.mutate()}
                          disabled={ebayPaymentMut.isPending}
                        >
                          {ebayPaymentMut.isPending ? 'Pobieram payment...' : 'eBay Payment'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => ebayReturnMut.mutate()}
                          disabled={ebayReturnMut.isPending}
                        >
                          {ebayReturnMut.isPending ? 'Pobieram return...' : 'eBay Return'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => ebayOffersMut.mutate()}
                          disabled={ebayOffersMut.isPending}
                        >
                          {ebayOffersMut.isPending ? 'Pobieram offers...' : 'eBay Offers'}
                        </Button>
                      </>
                    )}
                    {platform === 'OTOMOTO' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => otomotoCategoryMut.mutate()}
                          disabled={otomotoCategoryMut.isPending}
                        >
                          {otomotoCategoryMut.isPending ? 'Pobieram kategorię...' : 'Otomoto Category'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => otomotoAdvertsMut.mutate()}
                          disabled={otomotoAdvertsMut.isPending}
                        >
                          {otomotoAdvertsMut.isPending ? 'Pobieram adverts...' : 'Otomoto Adverts'}
                        </Button>
                      </>
                    )}
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
        onClose={() => {
          if (isOAuthConnecting) return;
          setOauthPlatform(null);
        }}
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

function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const backendMessage = (error.response?.data as { error?: string } | undefined)?.error;
    if (backendMessage) return backendMessage;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
