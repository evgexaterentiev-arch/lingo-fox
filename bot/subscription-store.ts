import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export interface PaymentRequest {
  id: string;
  userId: number;
  username?: string;
  firstName: string;
  locale: 'ru' | 'uk';
  amount: '150' | '300';
  currency: 'UAH' | 'RUB';
  createdAt: string;
}

export interface SubscriptionRecord {
  userId: number;
  expiresAt: string;
  purchasedAt: string;
  locale: 'ru' | 'uk';
  amount: string;
  currency: 'UAH' | 'RUB';
}

interface StoreData {
  pending: Record<string, PaymentRequest>;
  subscriptions: Record<string, SubscriptionRecord>;
}

const filePath = resolve(process.env.SUBSCRIPTIONS_FILE?.trim() || './data/subscriptions.json');
const emptyStore: StoreData = { pending: {}, subscriptions: {} };

async function readStore(): Promise<StoreData> {
  try {
    const data = JSON.parse(await readFile(filePath, 'utf8')) as Partial<StoreData>;
    return {
      pending: data.pending && typeof data.pending === 'object' ? data.pending : {},
      subscriptions: data.subscriptions && typeof data.subscriptions === 'object' ? data.subscriptions : {},
    };
  } catch {
    return emptyStore;
  }
}

async function writeStore(data: StoreData) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export const createPaymentRequest = async (request: Omit<PaymentRequest, 'id' | 'createdAt'>) => {
  const data = await readStore();
  const id = `payment_${Date.now()}_${request.userId}`;
  const value: PaymentRequest = { ...request, id, createdAt: new Date().toISOString() };
  data.pending[id] = value;
  await writeStore(data);
  return value;
};

export const getPaymentRequest = async (id: string) => (await readStore()).pending[id] ?? null;

export const removePaymentRequest = async (id: string) => {
  const data = await readStore();
  const request = data.pending[id] ?? null;
  if (request) {
    delete data.pending[id];
    await writeStore(data);
  }
  return request;
};

export const grantSubscription = async (request: PaymentRequest) => {
  const data = await readStore();
  const current = data.subscriptions[String(request.userId)];
  const start = current && new Date(current.expiresAt) > new Date() ? new Date(current.expiresAt) : new Date();
  const expires = new Date(start);
  expires.setDate(expires.getDate() + 30);
  const subscription: SubscriptionRecord = {
    userId: request.userId,
    expiresAt: expires.toISOString(),
    purchasedAt: new Date().toISOString(),
    locale: request.locale,
    amount: request.amount,
    currency: request.currency,
  };
  data.subscriptions[String(request.userId)] = subscription;
  delete data.pending[request.id];
  await writeStore(data);
  return subscription;
};

export const getSubscription = async (userId: number) => {
  const subscription = (await readStore()).subscriptions[String(userId)];
  if (!subscription || new Date(subscription.expiresAt) <= new Date()) return null;
  return subscription;
};

export const getStorePath = () => filePath;
