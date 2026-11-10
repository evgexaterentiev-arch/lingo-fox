import type { Locale } from '../types';
import { FoxMascot } from './FoxMascot';
import { getCopy } from '../lib/i18n';

interface LanguageScreenProps {
  onSelect: (locale: Locale) => void;
}

export function LanguageScreen({ onSelect }: LanguageScreenProps) {
  const t = getCopy('ru');

  return (
    <main className="app-shell language-screen">
      <div className="language-hero">
        <FoxMascot size="large" mood="hello" />
        <p className="eyebrow">Lingo Fox</p>
        <h1>{t.chooseLanguage}</h1>
        <p>{t.chooseLanguageHint}</p>
      </div>
      <div className="language-options" role="radiogroup" aria-label={t.chooseLanguage}>
        <button className="language-option" type="button" onClick={() => onSelect('ru')}>
          <span className="language-option__flag">🇷🇺</span>
          <span><strong>Русский</strong><small>Интерфейс и переводы</small></span>
          <span aria-hidden="true">→</span>
        </button>
        <button className="language-option" type="button" onClick={() => onSelect('uk')}>
          <span className="language-option__flag">🇺🇦</span>
          <span><strong>Українська</strong><small>Інтерфейс і переклади</small></span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  );
}
