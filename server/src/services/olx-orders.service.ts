import axios from 'axios';
import { OrderStatus } from '@prisma/client';
import { env } from '../utils/env';
import { getValidAccessToken } from './olx-oauth.service';
import { RawOrderInput } from './order.service';

const BASE = 'https://www.olx.pl/api/partner';

const STATUS_MAP: Record<string, OrderStatus> = {
  new: 'NEW',
  cancelled: 'CANCELLED',
  active: 'CONFIRMED',
};

interface OlxOrder {
  id: string;
  status: string;
  buyer: { name?: string; email?: string; phone?: string };
  items?: Array<{ id: string; title: string; quantity: number; price: number }>;
  total_price?: number;
  delivery?: { address?: object };
}

// MOCK MODE — wymaga OLX_MOCK=false i prawdziwego tokenu użytkownika
const MOCK_ORDERS: RawOrderInput[] = [
  {
    externalOrderId: 'mock-olx-001',
    status: 'NEW',
    buyerFirstName: 'Anna',
    buyerLastName: 'Zielińska',
    buyerEmail: 'anna@example.com',
    totalAmount: 180,
    currency: 'PLN',
    items: [{ title: 'Zderzak przedni Opel Astra H', quantity: 1, unitPrice: 180 }],
  },
];

export async function fetchOlxOrders(userId: string): Promise<RawOrderInput[]> {
  if (env.OLX_MOCK) return MOCK_ORDERS;

  const token = await getValidAccessToken(userId);
  const { data } = await axios.get<{ data: OlxOrder[] }>(`${BASE}/orders`, {
    headers: { Authorization: `Bearer ${token}`, Version: '2.0' },
  });

  return (data.data ?? []).map((o) => {
    const [firstName, ...rest] = (o.buyer.name ?? '').split(' ');
    return {
      externalOrderId: o.id,
      status: (STATUS_MAP[o.status] ?? 'NEW') as OrderStatus,
      buyerFirstName: firstName,
      buyerLastName: rest.join(' ') || undefined,
      buyerEmail: o.buyer.email,
      buyerPhone: o.buyer.phone,
      deliveryAddress: o.delivery?.address ?? undefined,
      totalAmount: o.total_price ?? 0,
      currency: 'PLN',
      items: (o.items ?? []).map((i) => ({
        externalId: i.id,
        title: i.title,
        quantity: i.quantity,
        unitPrice: i.price,
      })),
    };
  });
}
