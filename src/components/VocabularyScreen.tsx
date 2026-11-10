import type { LearningProgress, Locale } from '../types';
import { getLearnedVocabulary, translateWord } from '../content/vocabulary';
import { getCopy } from '../lib/i18n';
import { FoxMascot } from './FoxMascot';

interface VocabularyScreenProps {
  progress: LearningProgress;
  locale: Locale;
  onNavigateHome: () => void;
}

export function VocabularyScreen({ progress, locale, onNavigateHome }: VocabularyScreenProps) {
  const t = getCopy(locale);
  const learnedWords = getLearnedVocabulary(progress.completedLessonIds);

  return (
    <main className="app-shell vocabulary-screen">
      <header className="vocabulary-header">
        <button className="back-button" type="button" onClick={onNavigateHome} aria-label={t.home}>←</button>
        <h1>{t.vocabulary}</h1>
        <div />
      </header>
      <section className="vocabulary-hero">
        <div className="vocabulary-avatar"><FoxMascot size="medium" mood="think" animate /></div>
        <h2>{t.learnedWords}: {learnedWords.length}</h2>
        <p>{t.vocabularyEmpty}</p>
      </section>
      {learnedWords.length === 0 ? (
        <div className="vocabulary-empty"><FoxMascot size="small" mood="sleep" /><p>{t.vocabularyEmpty}</p></div>
      ) : (
        <div className="vocabulary-list">
          {learnedWords.map((word, index) => (
            <article className="vocabulary-card" key={word.id}>
              <div className="vocabulary-item__number">{index + 1}</div>
              <div className="vocabulary-card__main">
                <div className="vocabulary-card__english"><strong lang="en">{word.english}</strong>{word.transcription && <span className="vocabulary-card__transcription">[{word.transcription}]</span>}</div>
                <div className="vocabulary-card__russian">{translateWord(word, locale)}</div>
              </div>
              {word.example && <p className="vocabulary-card__example"><span>{t.example}:</span> <span lang="en">{word.example}</span></p>}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
