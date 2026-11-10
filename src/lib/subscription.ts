import type { Locale, Subscription } from '../types';
import { getTelegramWebApp } from './telegram';

const apiUrl = (import.meta.env.VITE_BOT_API_URL as string | undefined)?.replace(/\/$/, '');

const request = async <T>(path: string, init?: RequestInit): Promise<T | null> => {
  if (!apiUrl) return null;
  const webApp = getTelegramWebApp();
  if (!webApp?.initData) return null;
  try {
    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': webApp.initData, ...(init?.headers ?? {}) },
    });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
};

export const requestPremium = async (locale: Locale) => request<{ requestId: string; status: 'pending' }>('/api/payment-request', { method: 'POST', body: JSON.stringify({ locale }) });
export const fetchSubscription = async () => request<{ subscription: Subscription | null }>('/api/subscription');
export const isSubscriptionApiConfigured = () => Boolean(apiUrl && getTelegramWebApp()?.initData);
