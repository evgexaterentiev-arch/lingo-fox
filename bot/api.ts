import { createHmac } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { Bot } from 'grammy';
import { notifyAdminAboutPayment } from './payments';
import { getSubscription } from './subscription-store';

const token = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? '';
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 8787);

const readBody = (request: IncomingMessage) => new Promise<string>((resolve, reject) => {
  let body = '';
  request.on('data', (chunk) => { body += chunk; });
  request.on('end', () => resolve(body));
  request.on('error', reject);
});

const validateInitData = (initData: string) => {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash || !token) return null;
  params.delete('hash');
  const dataCheckString = [...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(token).digest();
  const expected = createHmac('sha256', secret).update(dataCheckString).digest('hex');
  if (expected !== hash) return null;
  const authDate = Number(params.get('auth_date'));
  if (!authDate || Date.now() / 1000 - authDate > 86400) return null;
  const userRaw = params.get('user');
  if (!userRaw) return null;
  try {
    return JSON.parse(userRaw) as { id: number; username?: string; first_name?: string };
  } catch {
    return null;
  }
};

const send = (response: ServerResponse, status: number, payload: unknown) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.WEBAPP_ORIGIN ?? '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Telegram-Init-Data',
  });
  response.end(JSON.stringify(payload));
};

export const startApiServer = (bot: Bot) => {
  const apiServer = createServer(async (request, response) => {
    if (request.method === 'OPTIONS') {
      response.writeHead(204, { 'Access-Control-Allow-Origin': process.env.WEBAPP_ORIGIN ?? '*', 'Access-Control-Allow-Headers': 'Content-Type, X-Telegram-Init-Data' });
      response.end();
      return;
    }

    const user = validateInitData(String(request.headers['x-telegram-init-data'] ?? ''));
    if (!user) {
      send(response, 401, { error: 'Invalid Telegram initData' });
      return;
    }

    if (request.url === '/api/subscription' && request.method === 'GET') {
      send(response, 200, { subscription: await getSubscription(user.id) });
      return;
    }

    if (request.url === '/api/payment-request' && request.method === 'POST') {
      try {
        const body = JSON.parse(await readBody(request)) as { locale?: unknown };
        const locale = body.locale === 'uk' ? 'uk' : 'ru';
        const payment = await notifyAdminAboutPayment(bot, user.id, user.username, user.first_name ?? 'Пользователь', locale);
        send(response, 200, { requestId: payment.id, status: 'pending' });
      } catch (error) {
        console.error('Payment request error:', error);
        send(response, 400, { error: 'Could not create payment request' });
      }
      return;
    }

    send(response, 404, { error: 'Not found' });
  });

  apiServer.listen(port, '0.0.0.0', () => console.log(`Subscription API listening on ${port}`));
};
