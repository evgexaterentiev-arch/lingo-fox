import { useMemo, useState } from 'react';
import { getCopy } from '../lib/i18n';
import { haptic } from '../lib/telegram';
import type { Exercise, LearningProgress, Lesson, Locale } from '../types';
import { AnimalSpeaker } from './AnimalSpeaker';
import { FoxMascot } from './FoxMascot';

interface LessonScreenProps {
  lesson: Lesson;
  locale: Locale;
  progress: LearningProgress;
  onLoseHeart: () => void;
  onExit: () => void;
  onComplete: (result: { correctAnswers: number; totalAnswers: number; xpEarned: number }) => void;
}

type Feedback = 'correct' | 'incorrect' | null;

const sameWords = (first: string[], second: string[]) => first.length === second.length && first.every((word, index) => word === second[index]);
const isAnswerCorrect = (exercise: Exercise, value: string | string[]) => exercise.kind === 'build' ? Array.isArray(value) && sameWords(value, exercise.answer) : typeof value === 'string' && value === exercise.answer;

function ChoiceExercise({ exercise, value, disabled, onChange }: { exercise: Extract<Exercise, { kind: 'choice' }>; value: string; disabled: boolean; onChange: (value: string) => void }) {
  return <div className="answer-grid" role="radiogroup" aria-label={exercise.prompt}>{exercise.options.map((option) => <button aria-checked={value === option} className={`answer-option ${value === option ? 'answer-option--selected' : ''}`} disabled={disabled} key={option} role="radio" type="button" onClick={() => { haptic.select(); onChange(option); }}>{option}</button>)}</div>;
}

function FillExercise({ exercise, value, disabled, onChange }: { exercise: Extract<Exercise, { kind: 'fill' }>; value: string; disabled: boolean; onChange: (value: string) => void }) {
  const sentenceParts = exercise.sentence.split('___');
  return <><p className="fill-sentence" lang="en">{sentenceParts[0]}<span className={`fill-blank ${value ? 'fill-blank--filled' : ''}`}>{value || '...'}</span>{sentenceParts[1]}</p><div className="answer-grid answer-grid--compact" role="radiogroup" aria-label="Варианты ответа">{exercise.options.map((option) => <button aria-checked={value === option} className={`answer-option ${value === option ? 'answer-option--selected' : ''}`} disabled={disabled} key={option} role="radio" type="button" onClick={() => { haptic.select(); onChange(option); }}>{option}</button>)}</div></>;
}

function BuildExercise({ exercise, value, disabled, onChange }: { exercise: Extract<Exercise, { kind: 'build' }>; value: string[]; disabled: boolean; onChange: (value: string[]) => void }) {
  const remainingTokens = useMemo(() => {
    const selectedCounts = value.reduce<Record<string, number>>((counts, token) => { counts[token] = (counts[token] ?? 0) + 1; return counts; }, {});
    return exercise.tokens.filter((token) => { if (!selectedCounts[token]) return true; selectedCounts[token] -= 1; return false; });
  }, [exercise.tokens, value]);
  return <div className="build-exercise"><div className="word-tray" aria-label="Твоя фраза" lang="en">{value.length === 0 ? <span className="word-tray__hint">Нажми на слова ниже</span> : value.map((word, index) => <button className="word-chip word-chip--selected" disabled={disabled} key={`${word}-${index}`} type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}>{word}</button>)}</div><div className="word-bank" aria-label="Доступные слова" lang="en">{remainingTokens.map((word, index) => <button className="word-chip" disabled={disabled} key={`${word}-${index}`} type="button" onClick={() => onChange([...value, word])}>{word}</button>)}</div></div>;
}

function AudioExercise({ exercise, locale, value, disabled, onChange }: { exercise: Extract<Exercise, { kind: 'audio' }>; locale: Locale; value: string; disabled: boolean; onChange: (value: string) => void }) {
  const t = getCopy(locale);
  return <><AnimalSpeaker speaker={exercise.speaker} phrase={exercise.phrase} locale={locale} /><p className="prompt-hint">{t.audioHint}</p><div className="answer-grid answer-grid--compact" role="radiogroup" aria-label={exercise.prompt}>{exercise.options.map((option) => <button aria-checked={value === option} className={`answer-option ${value === option ? 'answer-option--selected' : ''}`} disabled={disabled} key={option} role="radio" type="button" onClick={() => { haptic.select(); onChange(option); }}>{option}</button>)}</div></>;
}

export function LessonScreen({ lesson, locale, progress, onLoseHeart, onComplete, onExit }: LessonScreenProps) {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string | string[]>('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const t = getCopy(locale);
  const exercise = lesson.exercises[exerciseIndex];
  const premium = progress.subscription.isPremium && (!progress.subscription.expiresAt || new Date(progress.subscription.expiresAt) > new Date());
  const hearts = premium ? Infinity : progress.hearts;
  const progressValue = ((exerciseIndex + (feedback ? 1 : 0)) / lesson.exercises.length) * 100;
  const selected = Array.isArray(selectedValue) ? selectedValue.length > 0 : Boolean(selectedValue);
  const correct = feedback === 'correct';
  const isBlocked = !premium && progress.hearts <= 0;

  const checkAnswer = () => {
    if (!selected || feedback || isBlocked) return;
    const nextFeedback = isAnswerCorrect(exercise, selectedValue) ? 'correct' : 'incorrect';
    setFeedback(nextFeedback);
    if (nextFeedback === 'correct') {
      setCorrectAnswers((count) => count + 1);
      haptic.correct();
    } else {
      onLoseHeart();
      haptic.incorrect();
    }
  };

  const moveForward = () => {
    if (!feedback) return;
    const isLastExercise = exerciseIndex === lesson.exercises.length - 1;
    const finalCorrectAnswers = correctAnswers + (feedback === 'correct' ? 1 : 0);
    if (isLastExercise) {
      onComplete({ correctAnswers: finalCorrectAnswers, totalAnswers: lesson.exercises.length, xpEarned: Math.max(5, finalCorrectAnswers * 10 + (premium ? 10 : progress.hearts * 2)) });
      return;
    }
    setExerciseIndex((value) => value + 1);
    setSelectedValue('');
    setFeedback(null);
  };

  const resetBuildAnswer = () => { if (exercise.kind === 'build' && Array.isArray(selectedValue)) setSelectedValue([]); };

  return <main className="lesson-screen"><header className="lesson-header"><button aria-label="Выйти из урока" className="icon-button" type="button" onClick={onExit}>×</button><div className="lesson-progress" aria-label={`${t.lesson} ${exerciseIndex + 1} из ${lesson.exercises.length}`}><span style={{ width: `${progressValue}%` }} /></div><div className="hearts" aria-label={`${t.hearts}: ${premium ? '∞' : `${progress.hearts}/5`}`}><span aria-hidden="true">♥</span><strong>{premium ? '∞' : progress.hearts}</strong></div></header>
    {isBlocked ? <section className="lesson-blocked"><FoxMascot size="medium" mood="think" /><h1>{locale === 'uk' ? 'Життя закінчилися' : 'Жизни закончились'}</h1><p>{locale === 'uk' ? 'Наступне життя з’явиться через годину. А Premium відкриває безмежні життя.' : 'Следующая жизнь появится через час. Premium открывает бесконечные жизни.'}</p><button className="secondary-button" type="button" onClick={onExit}>{t.profile}</button></section> : <><section className="lesson-content" aria-labelledby="exercise-title"><div className="lesson-context"><span>{lesson.icon}</span><p>{lesson.title}</p></div><p className="eyebrow">{t.lesson} {exerciseIndex + 1} / {lesson.exercises.length}</p><h1 id="exercise-title">{exercise.prompt}</h1>{exercise.promptHint && <p className="prompt-hint">{exercise.promptHint}</p>}<div className="exercise-area">{exercise.kind === 'choice' && <ChoiceExercise disabled={Boolean(feedback)} exercise={exercise} value={typeof selectedValue === 'string' ? selectedValue : ''} onChange={setSelectedValue} />}{exercise.kind === 'fill' && <FillExercise disabled={Boolean(feedback)} exercise={exercise} value={typeof selectedValue === 'string' ? selectedValue : ''} onChange={setSelectedValue} />}{exercise.kind === 'build' && <BuildExercise disabled={Boolean(feedback)} exercise={exercise} value={Array.isArray(selectedValue) ? selectedValue : []} onChange={setSelectedValue} />}{exercise.kind === 'audio' && <AudioExercise disabled={Boolean(feedback)} exercise={exercise} locale={locale} value={typeof selectedValue === 'string' ? selectedValue : ''} onChange={setSelectedValue} />}</div>{exercise.kind === 'build' && !feedback && <button className="text-button" disabled={!selected} type="button" onClick={resetBuildAnswer}>Очистить фразу</button>}</section><footer className={`answer-footer ${feedback ? `answer-footer--${feedback}` : ''}`}>{feedback && <div className="feedback-panel" aria-live="polite"><FoxMascot size="small" mood={correct ? 'cheer' : 'think'} /><div><strong>{correct ? t.correct : t.incorrect}</strong><p>{correct ? exercise.note : `Верный ответ: ${exercise.kind === 'build' ? exercise.answer.join(' ') : exercise.answer}. ${exercise.note}`}</p></div></div>}<button className={`check-button ${feedback ? 'check-button--next' : ''}`} disabled={!feedback && (!selected || isBlocked)} type="button" onClick={feedback ? moveForward : checkAnswer}>{feedback ? (exerciseIndex === lesson.exercises.length - 1 ? t.finishLesson : t.next) : t.check}<span aria-hidden="true">{feedback ? '→' : '✓'}</span></button></footer></>}
  </main>;
}
