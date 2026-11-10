# Lingo Fox 🦊

Оригинальный Telegram Mini App для изучения английского: короткие A1-уроки, упражнения, XP, серия занятий, лис-маскот и Premium подписка через Crypto Bot.

> **Важно о токене:** ранее отправленный в чат токен нужно считать раскрытым. Перевыпустите его через [@BotFather](https://t.me/BotFather) (`/revoke`), а новый токен храните **только** в локальном `.env`. Не вставляйте токен в исходный код, Git или переписку.

## Что уже есть

- Mini App с собственной лисьей визуальной системой, не копирующей чужой бренд или графику;
- 4 тематических A1-модуля и 8 коротких уроков;
- задания на перевод, сбор фразы и заполнение пропуска;
- XP, серия дней, дневная цель, энергия и локальное сохранение прогресса;
- **экран профиля** с детальной статистикой пользователя;
- **Premium подписка** с оплатой через Crypto Bot (USDT, TON, BTC, ETH);
- интеграция с Crypto Pay API для обработки платежей;
- Telegram Web Apps SDK: тема, разворачивание Mini App и haptic feedback;
- бот на `grammY`: `/start` **сначала приветствует**, затем присылает кнопку открытия Mini App;
- команда `/premium` для быстрой покупки подписки;
- безопасная конфигурация через `.env` и `.env.example`.

## Требования

- [Node.js](https://nodejs.org/) 20 или новее;
- Telegram-бот из BotFather;
- для открытия Mini App в Telegram — публичный **HTTPS** URL. Для разработки подойдёт Cloudflare Tunnel или ngrok.

## Установка

Откройте терминал в папке проекта:

```bash
cd "D:\Lingo Fox"
npm install
copy .env.example .env
```

Откройте `.env` в редакторе и укажите **новый, перевыпущенный** токен:

```dotenv
TELEGRAM_BOT_TOKEN=ваш_новый_токен_из_BotFather
TELEGRAM_ADMIN_ID=6899133760
WEBAPP_URL=
CRYPTO_PAY_TOKEN=ваш_токен_из_CryptoBot
```

### Получение Crypto Pay токена

1. Откройте [@CryptoBot](https://t.me/CryptoBot) в Telegram
2. Перейдите: **Crypto Pay** → **API** → **Create App**
3. Укажите название приложения (например, "Lingo Fox")
4. Скопируйте полученный токен и добавьте в `.env` как `CRYPTO_PAY_TOKEN`

> **Примечание:** Без `CRYPTO_PAY_TOKEN` функция оплаты Premium будет недоступна, но приложение продолжит работать в базовом режиме.

`TELEGRAM_ADMIN_ID` предусмотрен для будущих служебных функций.

## Запуск интерфейса и бота

```bash
npm run dev
```

После запуска:

- веб-интерфейс: `http://localhost:5173`;
- бот работает локально через long polling;
- пока `WEBAPP_URL` пуст, `/start` в Telegram пришлёт приветствие и объяснит, как завершить настройку, без нерабочей кнопки.

Можно открыть `http://localhost:5173` в браузере: это полноценный режим предпросмотра без Telegram.

## Подключение Mini App через Cloudflare Tunnel

1. Оставьте `npm run dev` запущенным.
2. В отдельном терминале установите [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) (один раз), затем запустите:

   ```bash
   cloudflared tunnel --url http://localhost:5173
   ```

3. Скопируйте выданный адрес вида `https://something.trycloudflare.com`.
4. Вставьте его в `.env`:

   ```dotenv
   WEBAPP_URL=https://something.trycloudflare.com
   ```

5. Перезапустите `npm run dev`.
6. Откройте личный чат с ботом и отправьте `/start`.

Бот сначала отправит приветствие от Линго Лиса, затем отдельным сообщением — кнопку **«Открыть урок 🦊»**. Нажмите её в мобильном Telegram, чтобы открыть Mini App.

### Альтернатива: ngrok

Если установлен [ngrok](https://ngrok.com/), в отдельном терминале выполните:

```bash
ngrok http 5173
```

Возьмите HTTPS forwarding URL и заполните `WEBAPP_URL` так же, как в инструкции выше.

## Создание или перевыпуск токена в BotFather

1. Откройте [@BotFather](https://t.me/BotFather).
2. Если бота ещё нет: используйте `/newbot`, выберите имя и username, оканчивающийся на `bot`.
3. Если токен когда-либо был отправлен в чат: используйте `/revoke`, выберите бота и подтвердите отзыв токена.
4. Получите новый токен и вставьте **только в ваш локальный `.env`**.
5. Никому не отправляйте значение токена. Если оно стало публичным — снова перевыпустите токен.

## Проверки

```bash
npm run typecheck
npm test
npm run build
```

## Структура

```text
bot/index.ts              # Telegram bot и безопасный /start flow
src/content/course.ts     # A1-курс и задания
src/components/           # Экраны Mini App и лис-маскот
src/lib/progress.ts       # Локальное сохранение XP, серии и уроков
src/lib/telegram.ts       # Telegram Web Apps SDK адаптер
```

## Хранение данных и следующая версия

В MVP прогресс живёт в `localStorage` на устройстве. Telegram-данные используются только для приветствия в интерфейсе. Для серверной синхронизации в следующей версии нужно передавать `Telegram.WebApp.initData` на trusted backend и **обязательно валидировать** подпись по официальной документации Telegram до связывания прогресса с пользователем.

Для рабочего production-развёртывания замените long polling на webhook с HTTPS-доменом и храните секреты в переменных окружения хостинга.
