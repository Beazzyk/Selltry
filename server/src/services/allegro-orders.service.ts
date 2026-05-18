import axios from 'axios';
import { OrderStatus } from '@prisma/client';
import { env } from '../utils/env';
import { getValidAccessToken as getAllegroUserToken } from './allegro-oauth.service';
import { RawOrderInput } from './order.service';

const BASE = env.ALLEGRO_SANDBOX
  ? 'https://api.allegro.pl.allegrosandbox.pl'
  : 'https://api.allegro.pl';

const STATUS_MAP: Record<string, OrderStatus> = {
  BOUGHT: 'NEW',
  FILLED_IN: 'NEW',
  READY_FOR_PROCESSING: 'CONFIRMED',
  IN_VERIFICATION: 'PROCESSING',
  CANCELLED: 'CANCELLED',
};

interface AllegroOrderItem {
  id: string;
  offer: { name: string };
  quantity: number;
  price: { amount: string };
}

interface AllegroOrder {
  id: string;
  status: string;
  buyer: { login: string; email: string; firstName?: string; lastName?: string; phone?: string };
  delivery?: { address?: { street?: string; city?: string; zipCode?: string; country?: { code: string } } };
  payment?: { paidAmount?: { amount: string; currency: string } };
  lineItems: AllegroOrderItem[];
  checkoutForms?: { href?: string };
}

interface AllegroOrdersResponse {
  checkoutForms: AllegroOrder[];
  totalCount: number;
}

// MOCK MODE — wymaga ALLEGRO_MOCK=false i prawdziwego tokenu użytkownika
const MOCK_ORDERS: RawOrderInput[] = [
  {
    externalOrderId: 'mock-allegro-001',
    status: 'NEW',
    buyerLogin: 'kupujacy123',
    buyerEmail: 'kupujacy@example.com',
    buyerFirstName: 'Jan',
    buyerLastName: 'Kowalski',
    buyerPhone: '500 100 200',
    deliveryAddress: { street: 'ul. Kwiatowa 5', city: 'Warszawa', zipCode: '00-001', country: 'PL' },
    totalAmount: 250,
    currency: 'PLN',
    platformOrderUrl: 'https://allegro.pl/moje-allegro/sprzedaz/zamowienia',
    items: [{ externalId: 'item-1', title: 'Lampa tylna Suzuki Samurai prawa', quantity: 1, unitPrice: 250 }],
  },
  {
    externalOrderId: 'mock-allegro-002',
    status: 'SHIPPED',
    buyerLogin: 'marta_k',
    buyerEmail: 'marta@example.com',
    buyerFirstName: 'Marta',
    buyerLastName: 'Nowak',
    totalAmount: 890,
    currency: 'PLN',
    items: [
      { externalId: 'item-2a', title: 'Amortyzator przedni lewy BMW E46', quantity: 1, unitPrice: 445 },
      { externalId: 'item-2b', title: 'Amortyzator przedni prawy BMW E46', quantity: 1, unitPrice: 445 },
    ],
  },
  {
    externalOrderId: 'mock-allegro-003',
    status: 'DELIVERED',
    buyerLogin: 'piotr_warsztat',
    buyerFirstName: 'Piotr',
    buyerLastName: 'Wiśniewski',
    totalAmount: 120,
    currency: 'PLN',
    items: [{ title: 'Filtr oleju VW Golf IV 1.9 TDI', quantity: 2, unitPrice: 60 }],
  },
];

export async function fetchAllegroOrders(userId: string): Promise<RawOrderInput[]> {
  if (env.ALLEGRO_MOCK) return MOCK_ORDERS;

  const token = await getAllegroUserToken(userId);
  const { data } = await axios.get<AllegroOrdersResponse>(
    `${BASE}/order/checkout-forms`,
    {
      params: { limit: 100, offset: 0 },
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.allegro.public.v1+json' },
    },
  );

  return data.checkoutForms.map((o) => ({
    externalOrderId: o.id,
    status: (STATUS_MAP[o.status] ?? 'NEW') as OrderStatus,
    buyerLogin: o.buyer.login,
    buyerEmail: o.buyer.email,
    buyerFirstName: o.buyer.firstName,
    buyerLastName: o.buyer.lastName,
    buyerPhone: o.buyer.phone,
    deliveryAddress: o.delivery?.address ?? undefined,
    totalAmount: parseFloat(o.payment?.paidAmount?.amount ?? '0'),
    currency: o.payment?.paidAmount?.currency ?? 'PLN',
    items: o.lineItems.map((li) => ({
      externalId: li.id,
      title: li.offer.name,
      quantity: li.quantity,
      unitPrice: parseFloat(li.price.amount),
    })),
  }));
}
