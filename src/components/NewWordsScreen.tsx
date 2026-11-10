import type { Locale, VocabularyWord } from '../types';
import { getCopy } from '../lib/i18n';
import { translateWord } from '../content/vocabulary';
import { FoxMascot } from './FoxMascot';

interface NewWordsScreenProps {
  locale: Locale;
  words: VocabularyWord[];
  onContinue: () => void;
  onExit: () => void;
}

export function NewWordsScreen({ locale, words, onContinue, onExit }: NewWordsScreenProps) {
  const t = getCopy(locale);
  return (
    <main className="new-words-screen app-shell">
      <header className="lesson-header">
        <button className="icon-button" type="button" onClick={onExit} aria-label="Назад">×</button>
        <span className="new-words-counter">{words.length} {locale === 'uk' ? 'слів' : 'слов'}</span>
      </header>
      <div className="new-words-header">
        <FoxMascot size="medium" mood="excited" animate />
        <h1>{t.newWords}</h1>
        <p>{t.newWordsHint}</p>
      </div>
      <div className="vocabulary-list">
        {words.map((word) => (
          <article className="vocabulary-card" key={word.id}>
            <div className="vocabulary-card__main">
              <div className="vocabulary-card__english">
                <strong lang="en">{word.english}</strong>
                {word.transcription && <span className="vocabulary-card__transcription">[{word.transcription}]</span>}
              </div>
              <div className="vocabulary-card__russian">{translateWord(word, locale)}</div>
            </div>
            {word.example && <p className="vocabulary-card__example"><span>{t.example}:</span> <span lang="en">{word.example}</span></p>}
          </article>
        ))}
      </div>
      <div className="new-words-footer">
        <button className="primary-button" type="button" onClick={onContinue}>{t.continue}<span aria-hidden="true">→</span></button>
      </div>
    </main>
  );
}
