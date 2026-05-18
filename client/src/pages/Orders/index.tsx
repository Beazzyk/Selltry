import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { getOrders, syncOrders } from '@/api/orders.api';
import { Order, OrderStatus, Platform } from '@/types';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'Nowe', CONFIRMED: 'Potwierdzone', PROCESSING: 'W realizacji',
  SHIPPED: 'Wysłane', DELIVERED: 'Dostarczone', CANCELLED: 'Anulowane',
  RETURNED: 'Zwrócone', REFUNDED: 'Zwrot środków',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800', CONFIRMED: 'bg-indigo-100 text-indigo-800',
  PROCESSING: 'bg-amber-100 text-amber-800', SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800',
  RETURNED: 'bg-orange-100 text-orange-800', REFUNDED: 'bg-gray-100 text-gray-700',
};

export const PLATFORM_BADGE: Record<Platform, string> = {
  ALLEGRO: 'bg-orange-500 text-white', OLX: 'bg-green-600 text-white',
  OTOMOTO: 'bg-red-600 text-white', OVOKO: 'bg-blue-800 text-white',
  EBAY: 'bg-red-500 text-white',
};

const STATUS_FILTERS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'Wszystkie' }, { value: 'NEW', label: 'Nowe' },
  { value: 'CONFIRMED', label: 'Potwierdzone' }, { value: 'PROCESSING', label: 'W realizacji' },
  { value: 'SHIPPED', label: 'Wysłane' }, { value: 'DELIVERED', label: 'Dostarczone' },
  { value: 'CANCELLED', label: 'Anulowane' },
];

export function buyerName(order: Order): string {
  const full = [order.buyerFirstName, order.buyerLastName].filter(Boolean).join(' ');
  return full || order.buyerLogin || '—';
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function OrdersPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', search, statusFilter],
    queryFn: () => getOrders({ search: search || undefined, status: statusFilter || undefined }),
  });

  const syncMut = useMutation({
    mutationFn: () => syncOrders(),
    onSuccess: (res) => {
      const total = Object.values(res.synced).reduce<number>(
        (acc, v) => acc + (typeof v === 'number' ? v : 0), 0,
      );
      toast(`Zsynchronizowano ${total} zamówień`, 'success');
      void qc.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => toast('Błąd synchronizacji', 'error'),
  });

  const orders = data?.items ?? [];
  const isEmpty = !isLoading && orders.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Zamówienia</h1>
        <Button variant="outline" size="sm" onClick={() => syncMut.mutate()} disabled={syncMut.isPending}>
          <RefreshCw className={cn('mr-2 h-4 w-4', syncMut.isPending && 'animate-spin')} />
          {syncMut.isPending ? 'Synchronizuję...' : 'Synchronizuj'}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9" placeholder="Szukaj zamówienia lub kupującego..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} onClick={() => setStatusFilter(f.value as OrderStatus | '')}
              className={cn('rounded-full px-3 py-1.5 text-xs font-medium transition-colors border',
                statusFilter === f.value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
              )}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Zamówienie</th>
              <th className="px-4 py-3 text-left">Kupujący</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Produkt</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Platforma</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Kwota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/orders/${order.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                    #{order.externalOrderId.slice(-8).toUpperCase()}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('pl-PL')}
                  </p>
                </td>
                <td className="px-4 py-3 text-gray-700">{buyerName(order)}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                  <p className="max-w-[200px] truncate">{order.items[0]?.title ?? '—'}</p>
                  {order.items.length > 1 && <p className="text-xs text-gray-400">+{order.items.length - 1} więcej</p>}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={cn('rounded px-2 py-0.5 text-xs font-semibold', PLATFORM_BADGE[order.platform])}>
                    {order.platform}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLORS[order.status])}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {Number(order.totalAmount).toFixed(2)} {order.currency}
                </td>
              </tr>
            ))}

            {isEmpty && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500">Brak zamówień</p>
                  <Button variant="outline" size="sm" className="mt-3"
                    onClick={() => syncMut.mutate()} disabled={syncMut.isPending}>
                    Pobierz zamówienia z platform
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > data.limit && (
        <p className="text-center text-sm text-gray-400">
          Wyświetlono {orders.length} z {data.total}
        </p>
      )}
    </div>
  );
}
