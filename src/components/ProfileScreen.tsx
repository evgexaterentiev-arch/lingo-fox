import type { LearningProgress, Locale } from '../types';
import { getCopy } from '../lib/i18n';
import { getTelegramWebApp } from '../lib/telegram';
import { isSubscriptionApiConfigured, requestPremium } from '../lib/subscription';
import { CharacterMascot } from './CharacterMascot';

interface ProfileScreenProps {
  progress: LearningProgress;
  userName: string | null;
  locale: Locale;
  onNavigateHome: () => void;
  onNavigateVocabulary: () => void;
  onCustomize: () => void;
  onChangeLanguage: () => void;
}

export function ProfileScreen({ progress, userName, locale, onNavigateHome, onNavigateVocabulary, onCustomize, onChangeLanguage }: ProfileScreenProps) {
  const t = getCopy(locale);
  const subscription = progress.subscription;
  const isPremium = subscription.isPremium && (!subscription.expiresAt || new Date(subscription.expiresAt) > new Date());
  const price = locale === 'uk' ? '150 грн/месяц' : '300 руб./месяц';

  const openPaymentChat = async () => {
    if (isSubscriptionApiConfigured()) {
      const request = await requestPremium(locale);
      if (request) {
        alert(t.subscriptionPending);
      }
    }
    const message = locale === 'uk'
      ? `Lingo Fox Premium, Telegram ID: ${getTelegramWebApp()?.initDataUnsafe?.user?.id ?? 'укажіть ID'}`
      : `Lingo Fox Premium, Telegram ID: ${getTelegramWebApp()?.initDataUnsafe?.user?.id ?? 'укажите ID'}`;
    const url = `https://t.me/morphosisss?text=${encodeURIComponent(message)}`;
    const webApp = getTelegramWebApp();
    if (webApp?.openTelegramLink) webApp.openTelegramLink(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="app-shell profile-screen">
      <header className="profile-header"><button className="back-button" type="button" onClick={onNavigateHome} aria-label={t.home}>←</button><h1>{t.profile}</h1><div /></header>
      <section className="profile-hero"><div className="profile-avatar"><CharacterMascot avatar={progress.avatar} size="large" mood={isPremium ? 'celebrate' : 'hello'} /></div><h2>{userName || (locale === 'uk' ? 'Учень' : 'Ученик')}</h2>{isPremium && <span className="premium-badge">👑 Premium</span>}</section>
      <section className="stats-summary"><div className="stat-item"><div className="stat-icon">⚡</div><div><strong>{progress.xp}</strong><p>XP</p></div></div><div className="stat-item"><div className="stat-icon">🔥</div><div><strong>{progress.streak}</strong><p>{locale === 'uk' ? 'Днів поспіль' : 'Дней подряд'}</p></div></div><div className="stat-item"><div className="stat-icon">📚</div><div><strong>{progress.learnedWordIds.length}</strong><p>{locale === 'uk' ? 'Слів' : 'Слов'}</p></div></div></section>
      <section className="profile-actions"><button className="action-button" type="button" onClick={onNavigateVocabulary}>📖 <span>{t.vocabulary}</span></button><button className="action-button" type="button" onClick={onCustomize}>🦊 <span>{t.customize}</span></button><button className="action-button" type="button" onClick={onChangeLanguage}>🌐 <span>{t.changeLanguage}</span></button></section>
      <section className="subscription-section"><h3>{t.premium}</h3>{isPremium ? <div className="subscription-card subscription-card--active"><div className="subscription-header"><span className="subscription-icon">👑</span><div><strong>{t.premium}</strong><p>{t.infiniteHearts}</p></div></div><div className="subscription-details"><div className="detail-row"><span>{locale === 'uk' ? 'До:' : 'Действует до:'}</span><strong>{subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString(locale === 'uk' ? 'uk-UA' : 'ru-RU') : '∞'}</strong></div></div></div> : <div className="subscription-card"><div className="subscription-header"><span className="subscription-icon">🎓</span><div><strong>{price}</strong><p>{locale === 'uk' ? 'Повний доступ і безмежні життя' : 'Полный доступ и бесконечные жизни'}</p></div></div><div className="premium-features"><h4>{locale === 'uk' ? 'Як оформити:' : 'Как оформить:'}</h4><p className="payment-instruction">{t.paymentInstruction}</p></div><button className="premium-button" type="button" onClick={openPaymentChat}>{t.openPaymentChat}<span aria-hidden="true">↗</span></button>{subscription.status === 'pending' && <p className="payment-note">{t.subscriptionPending}</p>}</div>}</section>
      <footer className="profile-footer"><div className="fox-tip" role="note"><CharacterMascot avatar={progress.avatar} size="small" mood="cheer" /><p>{locale === 'uk' ? 'Після оплати надішли чек @morphosisss — адміністратор активує Premium.' : 'После оплаты отправь чек в @morphosisss — администратор активирует Premium.'}</p></div></footer>
    </main>
  );
}
