import { useMutation } from '@tanstack/react-query';
import {
  getOlxDeliverySettings,
  getOlxAdverts,
  getOlxCategoryAttributes,
  getOtomotoAdverts,
  getOtomotoCategory,
} from '@/api/platforms.api';
import { useToast } from '@/components/ui/toast';
import { getRequestErrorMessage } from '@/lib/errors';
import { OLX_DEMO_CATEGORY_ID, OTOMOTO_DEMO_CATEGORY_ID } from '@/constants';

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
    otomotoCategoryMut,
    otomotoAdvertsMut,
  };
}
