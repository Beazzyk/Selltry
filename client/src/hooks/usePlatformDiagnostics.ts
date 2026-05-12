import { useMutation } from '@tanstack/react-query';
import {
  getOlxDeliverySettings,
  getOlxAdverts,
  getOlxCategoryAttributes,
  getEbayFulfillmentPolicies,
  getEbayOffers,
  getEbayPaymentPolicies,
  getEbayReturnPolicies,
  getOtomotoAdverts,
  getOtomotoCategory,
} from '@/api/platforms.api';
import { useToast } from '@/components/ui/toast';
import { getRequestErrorMessage } from '@/lib/errors';
import { EBAY_MARKETPLACE_US, OLX_DEMO_CATEGORY_ID, OTOMOTO_DEMO_CATEGORY_ID } from '@/constants';

export function usePlatformDiagnostics() {
  const { toast } = useToast();

  const olxDeliveryMut = useMutation({
    mutationFn: getOlxDeliverySettings,
    onSuccess: (r) => toast(`OLX delivery settings: ${Array.isArray(r.data) ? r.data.length : 0} rekordów`, 'success'),
    onError: (e) => toast(getRequestErrorMessage(e, 'Nie udało się pobrać OLX delivery settings'), 'error'),
  });

  const olxAdvertsMut = useMutation({
    mutationFn: getOlxAdverts,
    onSuccess: (r) => toast(`OLX adverts: ${Array.isArray(r.data) ? r.data.length : 0} rekordów`, 'success'),
    onError: (e) => toast(getRequestErrorMessage(e, 'Nie udało się pobrać OLX adverts'), 'error'),
  });

  const olxCategoryAttrsMut = useMutation({
    mutationFn: () => getOlxCategoryAttributes(OLX_DEMO_CATEGORY_ID),
    onSuccess: (r) =>
      toast(`OLX category attributes (${OLX_DEMO_CATEGORY_ID}): ${Array.isArray(r.data) ? r.data.length : 0} rekordów`, 'success'),
    onError: (e) => toast(getRequestErrorMessage(e, 'Nie udało się pobrać OLX category attributes'), 'error'),
  });

  const ebayFulfillmentMut = useMutation({
    mutationFn: () => getEbayFulfillmentPolicies(EBAY_MARKETPLACE_US),
    onSuccess: (r) =>
      toast(`eBay fulfillment policies: ${Array.isArray(r.fulfillmentPolicies) ? r.fulfillmentPolicies.length : 0} rekordów`, 'success'),
    onError: (e) => toast(getRequestErrorMessage(e, 'Nie udało się pobrać eBay fulfillment policies'), 'error'),
  });

  const ebayPaymentMut = useMutation({
    mutationFn: () => getEbayPaymentPolicies(EBAY_MARKETPLACE_US),
    onSuccess: (r) =>
      toast(`eBay payment policies: ${Array.isArray(r.paymentPolicies) ? r.paymentPolicies.length : 0} rekordów`, 'success'),
    onError: (e) => toast(getRequestErrorMessage(e, 'Nie udało się pobrać eBay payment policies'), 'error'),
  });

  const ebayReturnMut = useMutation({
    mutationFn: () => getEbayReturnPolicies(EBAY_MARKETPLACE_US),
    onSuccess: (r) =>
      toast(`eBay return policies: ${Array.isArray(r.returnPolicies) ? r.returnPolicies.length : 0} rekordów`, 'success'),
    onError: (e) => toast(getRequestErrorMessage(e, 'Nie udało się pobrać eBay return policies'), 'error'),
  });

  const ebayOffersMut = useMutation({
    mutationFn: getEbayOffers,
    onSuccess: (r) => toast(`eBay offers: ${Array.isArray(r.offers) ? r.offers.length : 0} rekordów`, 'success'),
    onError: (e) => toast(getRequestErrorMessage(e, 'Nie udało się pobrać eBay offers'), 'error'),
  });

  const otomotoCategoryMut = useMutation({
    mutationFn: () => getOtomotoCategory(OTOMOTO_DEMO_CATEGORY_ID),
    onSuccess: (r) => toast(`Otomoto category: ${String(r.name ?? r.id ?? 'OK')}`, 'success'),
    onError: (e) => toast(getRequestErrorMessage(e, 'Nie udało się pobrać kategorii Otomoto'), 'error'),
  });

  const otomotoAdvertsMut = useMutation({
    mutationFn: getOtomotoAdverts,
    onSuccess: (r) => toast(`Otomoto adverts: ${Array.isArray(r.data) ? r.data.length : 0} rekordów`, 'success'),
    onError: (e) => toast(getRequestErrorMessage(e, 'Nie udało się pobrać Otomoto adverts'), 'error'),
  });

  return {
    olxDeliveryMut,
    olxAdvertsMut,
    olxCategoryAttrsMut,
    ebayFulfillmentMut,
    ebayPaymentMut,
    ebayReturnMut,
    ebayOffersMut,
    otomotoCategoryMut,
    otomotoAdvertsMut,
  };
}
