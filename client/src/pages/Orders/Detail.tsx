import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ExternalLink, MapPin, Mail, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { getOrder, updateOrderStatus } from '@/api/orders.api';
import { OrderStatus } from '@/types';
import { STATUS_LABELS, STATUS_COLORS, PLATFORM_BADGE, buyerName } from './index';

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW:        ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED:    ['DELIVERED', 'RETURNED'],
  DELIVERED:  ['RETURNED', 'REFUNDED'],
  CANCELLED:  [],
  RETURNED:   ['REFUNDED'],
  REFUNDED:   [],
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [changing, setChanging] = useState<OrderStatus | null>(null);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id!),
    enabled: !!id,
  });

  const statusMut = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(id!, status),
    onMutate: (s) => setChanging(s),
    onSuccess: () => {
      toast('Status zaktualizowany', 'success');
      void qc.invalidateQueries({ queryKey: ['order', id] });
      void qc.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => toast('Błąd zmiany statusu', 'error'),
    onSettled: () => setChanging(null),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-gray-600">Nie znaleziono zamówienia.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/orders')}>
          Wróć do listy
        </Button>
      </div>
    );
  }

  const transitions = STATUS_TRANSITIONS[order.status] ?? [];
  const addr = order.deliveryAddress;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Zamówienia
        </Button>
      </div>

      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Zamówienie #{order.externalOrderId.slice(-8).toUpperCase()}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString('pl-PL', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('rounded px-2.5 py-1 text-xs font-semibold', PLATFORM_BADGE[order.platform])}>
              {order.platform}
            </span>
            <span className={cn('rounded-full px-3 py-1 text-xs font-medium', STATUS_COLORS[order.status])}>
              {STATUS_LABELS[order.status]}
            </span>
            {order.platformOrderUrl && (
              <a href={order.platformOrderUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline">
                <ExternalLink className="h-3 w-3" /> Otwórz na platformie
              </a>
            )}
          </div>
        </div>

        {/* Zmiana statusu */}
        {transitions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Zmień status:</p>
            <div className="flex gap-2 flex-wrap">
              {transitions.map((s) => (
                <Button key={s} size="sm" variant="outline"
                  disabled={!!changing} onClick={() => statusMut.mutate(s)}>
                  {changing === s ? 'Zapisuję...' : STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Kupujący */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Kupujący</h2>
          <InfoRow icon={User} label="Imię i nazwisko / login" value={buyerName(order)} />
          <InfoRow icon={Mail} label="Email" value={order.buyerEmail} />
          <InfoRow icon={Phone} label="Telefon" value={order.buyerPhone} />
          {addr && (
            <InfoRow icon={MapPin} label="Adres dostawy"
              value={[addr.street, `${addr.zipCode ?? ''} ${addr.city ?? ''}`.trim(), addr.country]
                .filter(Boolean).join(', ')} />
          )}
        </div>

        {/* Powiązane ogłoszenie */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Powiązane ogłoszenie</h2>
          {order.listing ? (
            <div className="flex items-center gap-3">
              {order.listing.images[0]?.url && (
                <img src={order.listing.images[0].url} alt="" className="h-14 w-14 rounded-lg object-cover border border-gray-200" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{order.listing.title}</p>
                <Button asChild size="sm" variant="outline" className="mt-1.5">
                  <a href={`/listings/${order.listing.id}/edit`}>Otwórz ogłoszenie</a>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Brak powiązanego ogłoszenia</p>
          )}

          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Ostatnia synchronizacja</p>
            <p className="text-sm text-gray-700">
              {new Date(order.syncedAt).toLocaleDateString('pl-PL', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Produkty */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Produkty ({order.items.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-2.5 text-left">Nazwa</th>
              <th className="px-5 py-2.5 text-center">Ilość</th>
              <th className="px-5 py-2.5 text-right">Cena jedn.</th>
              <th className="px-5 py-2.5 text-right">Razem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3 text-gray-900">{item.title}</td>
                <td className="px-5 py-3 text-center text-gray-600">{item.quantity}</td>
                <td className="px-5 py-3 text-right text-gray-600">{Number(item.unitPrice).toFixed(2)} {order.currency}</td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900">
                  {(Number(item.unitPrice) * item.quantity).toFixed(2)} {order.currency}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-gray-700 text-right">Łącznie</td>
              <td className="px-5 py-3 text-right text-lg font-bold text-gray-900">
                {Number(order.totalAmount).toFixed(2)} {order.currency}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
