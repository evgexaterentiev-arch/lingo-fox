import { Bot } from 'grammy';
import { createPaymentRequest, grantSubscription, removePaymentRequest } from './subscription-store';

export const ADMIN_ID = '6899133760';

export async function notifyAdminAboutPayment(
  bot: Bot,
  userId: number,
  username: string | undefined,
  firstName: string,
  locale: 'ru' | 'uk',
) {
  const request = await createPaymentRequest({
    userId,
    username,
    firstName,
    locale,
    amount: locale === 'uk' ? '150' : '300',
    currency: locale === 'uk' ? 'UAH' : 'RUB',
  });
  const label = request.currency === 'UAH' ? '150 грн' : '300 руб.';
  const message = [
    '💰 Новая заявка Lingo Fox Premium',
    '',
    `👤 ${firstName}${username ? ` (@${username})` : ''}`,
    `🆔 ${userId}`,
    `🌐 ${locale === 'uk' ? 'Українська' : 'Русский'}`,
    `💵 ${label}`,
    `🕐 ${new Date(request.createdAt).toLocaleString('ru-RU')}`,
    '',
    'Проверь оплату в @morphosisss и подтверди ниже.',
  ].join('\n');
  await bot.api.sendMessage(ADMIN_ID, message, {
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Выдать подписку', callback_data: `approve_${request.id}` },
        { text: '❌ Отклонить', callback_data: `reject_${request.id}` },
      ]],
    },
  });
  return request;
}

export async function handlePaymentApproval(bot: Bot, callbackQueryId: string, paymentId: string, approve: boolean) {
  const request = await removePaymentRequest(paymentId);
  if (!request) {
    await bot.api.answerCallbackQuery(callbackQueryId, { text: 'Заявка уже обработана или не найдена', show_alert: true });
    return;
  }
  if (!approve) {
    await bot.api.answerCallbackQuery(callbackQueryId, { text: 'Заявка отклонена' });
    await bot.api.sendMessage(request.userId, 'Заявка на Premium отклонена. Если это ошибка, напишите @morphosisss.');
    return;
  }

  try {
    const subscription = await grantSubscription(request);
    await bot.api.answerCallbackQuery(callbackQueryId, { text: '✅ Подписка выдана' });
    await bot.api.sendMessage(request.userId, `🎉 Premium активирована до ${new Date(subscription.expiresAt).toLocaleDateString(request.locale === 'uk' ? 'uk-UA' : 'ru-RU')}! Жизни теперь безграничны.`);
    await bot.api.sendMessage(ADMIN_ID, `✅ Premium выдана пользователю ${request.firstName} (${request.userId}) до ${new Date(subscription.expiresAt).toLocaleDateString('ru-RU')}`);
  } catch (error) {
    console.error('Failed to grant subscription:', error);
    await bot.api.answerCallbackQuery(callbackQueryId, { text: 'Ошибка сохранения подписки', show_alert: true });
  }
}
