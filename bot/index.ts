import 'dotenv/config';
import { Bot, InlineKeyboard } from 'grammy';
import { notifyAdminAboutPayment, handlePaymentApproval } from './payments';
import { startApiServer } from './api';

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const webAppUrl = process.env.WEBAPP_URL?.trim();
const adminId = process.env.TELEGRAM_ADMIN_ID?.trim();
const cryptoPayToken = process.env.CRYPTO_PAY_TOKEN?.trim();

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is missing. Copy .env.example to .env and add a newly issued BotFather token.');
  process.exit(1);
}

let parsedWebAppUrl: URL | null = null;
if (webAppUrl) {
  try {
    parsedWebAppUrl = new URL(webAppUrl);
    if (parsedWebAppUrl.protocol !== 'https:') {
      throw new Error('The Mini App URL must use HTTPS.');
    }
  } catch (error) {
    console.error(`WEBAPP_URL is invalid: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

const bot = new Bot(token);

// Crypto Pay API интеграция
export async function createCryptoPayInvoice(userId: number, currency: 'UAH' | 'RUB' = 'RUB') {
  if (!cryptoPayToken) {
    console.warn('CRYPTO_PAY_TOKEN not configured. Payments will not work.');
    return null;
  }

  const prices = {
    UAH: '150',
    RUB: '300',
  };

  try {
    const response = await fetch('https://pay.crypt.bot/api/createInvoice', {
      method: 'POST',
      headers: {
        'Crypto-Pay-API-Token': cryptoPayToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currency_type: 'fiat',
        fiat: currency,
        amount: prices[currency],
        description: `Lingo Fox Premium - 1 месяц (${prices[currency]} ${currency})`,
        payload: JSON.stringify({
          userId,
          type: 'premium_monthly',
          duration: 30,
          currency,
        }),
        paid_btn_name: 'callback',
        paid_btn_url: parsedWebAppUrl?.toString() || 'https://t.me/LingoFox_bot',
      }),
    });

    const data = await response.json();
    
    if (data.ok && data.result) {
      return data.result.pay_url;
    } else {
      console.error('Crypto Pay error:', data);
      return null;
    }
  } catch (error) {
    console.error('Failed to create invoice:', error);
    return null;
  }
}

bot.command('start', async (ctx) => {
  const startParam = ctx.match;
  
  if (startParam === 'pay') {
    return ctx.reply('Переношу вас к оформлению подписки...')
      .then(() => handlePremiumCommand(ctx));
  }
  
  const firstName = ctx.from?.first_name?.trim() || 'друг';
  const welcome = [
    `Привет, ${firstName}! Я Линго Лис 🦊`,
    '',
    'Будем учить английский маленькими шагами: короткие уроки, понятные подсказки и немного лисьего азарта.',
    '',
    '📚 Используй команду /translate для перевода любых слов!',
    'Например: /translate Hello',
  ].join('\n');

  await ctx.reply(welcome);

  if (!parsedWebAppUrl) {
    await ctx.reply(
      'Я почти готов открыть урок, но для Mini App ещё не указан публичный HTTPS-адрес. ' +
      'Добавь WEBAPP_URL в локальный .env после запуска туннеля и перезапусти бота.',
    );
    return;
  }

  const keyboard = new InlineKeyboard().webApp('Открыть урок 🦊', parsedWebAppUrl.toString());
  await ctx.reply('Когда будешь готов(а), нажми кнопку — начнём с первого шага.', {
    reply_markup: keyboard,
  });
});

async function handlePremiumCommand(ctx: any) {
  if (!cryptoPayToken) {
    await ctx.reply('Платежи временно недоступны. Попробуйте позже.');
    return;
  }

  const userId = ctx.from?.id;
  const username = ctx.from?.username;
  const firstName = ctx.from?.first_name || 'Пользователь';
  if (!userId) return;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🇺🇦 150 грн', callback_data: 'pay_uah' },
        { text: '🇷🇺 300 руб', callback_data: 'pay_rub' },
      ],
    ],
  };

  await ctx.reply(
    '👑 Lingo Fox Premium\n\n' +
    '✨ Доступ ко всем урокам\n' +
    '📚 Расширенный словарь\n' +
    '🎯 Индивидуальные упражнения\n' +
    '📊 Детальная статистика\n' +
    '❌ Без рекламы\n' +
    '⚡ Безлимитные жизни (5 сердец)\n\n' +
    '💰 Цена: 150 грн / 300 руб / месяц\n' +
    '💳 Выберите валюту для оплаты:',
    { reply_markup: keyboard }
  );
}

bot.command('premium', handlePremiumCommand);

// Обработка выбора валюты
bot.callbackQuery(/pay_(uah|rub)/, async (ctx) => {
  const currency = ctx.match[1].toUpperCase() as 'UAH' | 'RUB';
  const userId = ctx.from.id;
  const username = ctx.from.username;
  const firstName = ctx.from.first_name;

  await ctx.answerCallbackQuery();

  const payUrl = await createCryptoPayInvoice(userId, currency);
  
  if (payUrl) {
    // Уведомляем админа о запросе на оплату
    await notifyAdminAboutPayment(bot, userId, username, firstName, currency === 'UAH' ? 'uk' : 'ru');

    const keyboard = new InlineKeyboard().url('💳 Оплатить Premium', payUrl);
    await ctx.reply(
      `💳 Ссылка для оплаты создана!\n\n` +
      `Сумма: ${currency === 'UAH' ? '150 грн' : '300 руб'}\n\n` +
      `После оплаты администратор проверит платеж и активирует подписку.`,
      { reply_markup: keyboard }
    );
  } else {
    await ctx.reply('Не удалось создать платеж. Попробуйте позже.');
  }
});

// Обработка подтверждения/отклонения от админа
bot.callbackQuery(/approve_(.+)/, async (ctx) => {
  if (ctx.from.id.toString() !== adminId) {
    await ctx.answerCallbackQuery({ text: 'Только админ может это сделать', show_alert: true });
    return;
  }

  const paymentId = ctx.match[1];
  await handlePaymentApproval(bot, ctx.callbackQuery.id, paymentId, true);
});

bot.callbackQuery(/reject_(.+)/, async (ctx) => {
  if (ctx.from.id.toString() !== adminId) {
    await ctx.answerCallbackQuery({ text: 'Только админ может это сделать', show_alert: true });
    return;
  }

  const paymentId = ctx.match[1];
  await handlePaymentApproval(bot, ctx.callbackQuery.id, paymentId, false);
});

// Команда для перевода через @morphosisss
bot.command('translate', async (ctx) => {
  const text = ctx.match?.trim();
  
  if (!text) {
    await ctx.reply(
      'Используй команду так:\n' +
      '/translate слово или фраза\n\n' +
      'Например:\n' +
      '/translate Hello\n' +
      '/translate How are you?'
    );
    return;
  }
  
  await ctx.reply(
    `🦊 Отправляю на перевод к @morphosisss...\n\n` +
    `Текст: "${text}"`
  );
  
  try {
    await bot.api.sendMessage('@morphosisss', text);
    await ctx.reply('✅ Запрос отправлен! Ожидайте ответ от @morphosisss');
  } catch (error) {
    await ctx.reply('❌ Ошибка при отправке запроса. Попробуйте написать @morphosisss напрямую.');
  }
});

bot.command('help', async (ctx) => {
  await ctx.reply(
    'Команды бота:\n\n' +
    '/start — Открыть приложение\n' +
    '/premium — Оформить подписку (150 грн / 300 руб)\n' +
    '/translate <текст> — Перевести через @morphosisss\n' +
    '/help — Показать справку'
  );
});

bot.catch((error) => {
  console.error('Telegram bot error:', error.error);
});

async function start() {
  await bot.api.deleteWebhook({ drop_pending_updates: false });
  const me = await bot.api.getMe();
  console.log(`Lingo Fox bot @${me.username ?? me.id} is running in long-polling mode.`);
  if (adminId) console.log(`Administrator ID is configured: ${adminId}`);
  if (!parsedWebAppUrl) console.warn('WEBAPP_URL is not configured; /start will show setup guidance instead of a Mini App button.');
  if (!cryptoPayToken) console.warn('CRYPTO_PAY_TOKEN is not configured; payment features will be disabled.');
  startApiServer(bot);
  await bot.start({ allowed_updates: ['message', 'callback_query'] });
}

void start();
