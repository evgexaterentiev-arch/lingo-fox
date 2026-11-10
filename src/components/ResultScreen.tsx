import { FoxMascot } from './FoxMascot';

interface ResultScreenProps {
  correctAnswers: number;
  totalAnswers: number;
  earnedXp: number;
  isNewCompletion: boolean;
  onContinue: () => void;
}

export function ResultScreen({
  correctAnswers,
  totalAnswers,
  earnedXp,
  isNewCompletion,
  onContinue,
}: ResultScreenProps) {
  const accuracy = Math.round((correctAnswers / totalAnswers) * 100);
  const title = accuracy === 100 ? 'Лис в восторге!' : accuracy >= 75 ? 'Отличный темп!' : 'Урок пройден!';

  return (
    <main className="result-screen">
      <div className="result-confetti result-confetti--one" aria-hidden="true">✦</div>
      <div className="result-confetti result-confetti--two" aria-hidden="true">●</div>
      <div className="result-confetti result-confetti--three" aria-hidden="true">✦</div>
      <section className="result-card" aria-labelledby="result-title">
        <div className="result-fox-wrap">
          <span className="result-sun" />
          <FoxMascot mood="celebrate" size="large" />
        </div>
        <p className="eyebrow">Маленький шаг — большая победа</p>
        <h1 id="result-title">{title}</h1>
        <p className="result-description">
          {isNewCompletion
            ? 'Ты открыл(а) следующий шаг на своей лисьей тропе.'
            : 'Повторение укрепляет память — Лис это очень ценит.'}
        </p>
        <div className="result-stats">
          <div><strong>{correctAnswers}/{totalAnswers}</strong><span>верных</span></div>
          <div><strong>+{earnedXp}</strong><span>XP</span></div>
          <div><strong>{accuracy}%</strong><span>точность</span></div>
        </div>
        <button className="primary-button primary-button--wide" type="button" onClick={onContinue}>
          На карту уроков <span aria-hidden="true">→</span>
        </button>
      </section>
    </main>
  );
}
