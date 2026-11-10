/// <reference types="vite/client" />

interface Window {
  Telegram?: {
    WebApp?: import('./lib/telegram').TelegramWebApp;
  };
}
