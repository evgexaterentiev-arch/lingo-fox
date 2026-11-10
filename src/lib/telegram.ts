export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramHapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { user?: TelegramUser };
  colorScheme?: 'light' | 'dark';
  themeParams?: Record<string, string | undefined>;
  HapticFeedback?: TelegramHapticFeedback;
  ready: () => void;
  expand: () => void;
  openLink?: (url: string) => void;
  openTelegramLink?: (url: string) => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
}

export const getTelegramWebApp = () => {
  if (typeof window === 'undefined') return undefined;
  return window.Telegram?.WebApp;
};

export const initializeTelegram = () => {
  const webApp = getTelegramWebApp();
  if (!webApp) return undefined;

  webApp.ready();
  webApp.expand();
  webApp.setHeaderColor?.('#f7f4ee');
  webApp.setBackgroundColor?.('#f7f4ee');
  return webApp;
};

export const getTelegramName = () => getTelegramWebApp()?.initDataUnsafe?.user?.first_name;

export const haptic = {
  select: () => getTelegramWebApp()?.HapticFeedback?.selectionChanged(),
  correct: () => getTelegramWebApp()?.HapticFeedback?.notificationOccurred('success'),
  incorrect: () => getTelegramWebApp()?.HapticFeedback?.notificationOccurred('error'),
  tap: () => getTelegramWebApp()?.HapticFeedback?.impactOccurred('light'),
  success: () => getTelegramWebApp()?.HapticFeedback?.notificationOccurred('success'),
};
