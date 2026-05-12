import { Button } from '@/components/ui/button';
import { Platform } from '@/types';
import type { usePlatformDiagnostics } from '@/hooks/usePlatformDiagnostics';

interface Props {
  platform: Platform;
  diagnostics: ReturnType<typeof usePlatformDiagnostics>;
}

export function PlatformDiagnosticsPanel({ platform, diagnostics }: Props) {
  const { olxDeliveryMut, olxAdvertsMut, olxCategoryAttrsMut } = diagnostics;
  const { ebayFulfillmentMut, ebayPaymentMut, ebayReturnMut, ebayOffersMut } = diagnostics;
  const { otomotoCategoryMut, otomotoAdvertsMut } = diagnostics;

  if (platform === 'OLX') {
    return (
      <>
        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => olxDeliveryMut.mutate()} disabled={olxDeliveryMut.isPending}>
          {olxDeliveryMut.isPending ? 'Pobieram delivery...' : 'OLX Delivery'}
        </Button>
        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => olxCategoryAttrsMut.mutate()} disabled={olxCategoryAttrsMut.isPending}>
          {olxCategoryAttrsMut.isPending ? 'Pobieram atrybuty...' : 'OLX Attributes'}
        </Button>
        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => olxAdvertsMut.mutate()} disabled={olxAdvertsMut.isPending}>
          {olxAdvertsMut.isPending ? 'Pobieram adverts...' : 'OLX Adverts'}
        </Button>
      </>
    );
  }

  if (platform === 'EBAY') {
    return (
      <>
        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => ebayFulfillmentMut.mutate()} disabled={ebayFulfillmentMut.isPending}>
          {ebayFulfillmentMut.isPending ? 'Pobieram fulfillment...' : 'eBay Fulfillment'}
        </Button>
        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => ebayPaymentMut.mutate()} disabled={ebayPaymentMut.isPending}>
          {ebayPaymentMut.isPending ? 'Pobieram payment...' : 'eBay Payment'}
        </Button>
        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => ebayReturnMut.mutate()} disabled={ebayReturnMut.isPending}>
          {ebayReturnMut.isPending ? 'Pobieram return...' : 'eBay Return'}
        </Button>
        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => ebayOffersMut.mutate()} disabled={ebayOffersMut.isPending}>
          {ebayOffersMut.isPending ? 'Pobieram offers...' : 'eBay Offers'}
        </Button>
      </>
    );
  }

  if (platform === 'OTOMOTO') {
    return (
      <>
        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => otomotoCategoryMut.mutate()} disabled={otomotoCategoryMut.isPending}>
          {otomotoCategoryMut.isPending ? 'Pobieram kategorię...' : 'Otomoto Category'}
        </Button>
        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => otomotoAdvertsMut.mutate()} disabled={otomotoAdvertsMut.isPending}>
          {otomotoAdvertsMut.isPending ? 'Pobieram adverts...' : 'Otomoto Adverts'}
        </Button>
      </>
    );
  }

  return null;
}
