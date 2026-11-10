import { courseModules, isLessonUnlocked, lessonById, lessons } from '../content/course';
import { getDailyGoalProgress, getTimeUntilNextHeart, MAX_HEARTS } from '../lib/progress';
import { getCopy } from '../lib/i18n';
import type { LearningProgress, Locale } from '../types';
import { CharacterMascot } from './CharacterMascot';

interface HomeScreenProps {
  progress: LearningProgress;
  userName: string | null;
  locale: Locale;
  onStartLesson: (lessonId: string) => void;
  onNavigateToProfile: () => void;
  onNavigateToVocabulary: () => void;
}

const colorNames = { coral: 'коралловый', teal: 'бирюзовый', berry: 'ягодный', gold: 'золотой' };

export function HomeScreen({ progress, userName, locale, onStartLesson, onNavigateToProfile, onNavigateToVocabulary }: HomeScreenProps) {
  const t = getCopy(locale);
  const nextLesson = lessons.find((lesson) => !progress.completedLessonIds.includes(lesson.id)) ?? lessons[0];
  const dailyGoal = getDailyGoalProgress(progress);
  const totalProgress = Math.round((progress.completedLessonIds.length / lessons.length) * 100);
  const greeting = userName ? `${locale === 'uk' ? 'Привіт' : 'Привет'}, ${userName}!` : locale === 'uk' ? 'Привіт!' : 'Привет!';
  const premium = progress.subscription.isPremium && (!progress.subscription.expiresAt || new Date(progress.subscription.expiresAt) > new Date());
  const heartMinutes = getTimeUntilNextHeart(progress);

  return (
    <main className="app-shell home-screen">
      <header className="home-header">
        <div className="brand" aria-label="Lingo Fox"><span className="brand__mark">LF</span><span>Lingo Fox</span></div>
        <div className="header-actions">
          <div className="header-stat" aria-label={`${t.hearts}: ${premium ? '∞' : progress.hearts}/${MAX_HEARTS}`}><span aria-hidden="true">♥</span><strong>{premium ? '∞' : `${progress.hearts}/${MAX_HEARTS}`}</strong></div>
          <button className="profile-button" type="button" onClick={onNavigateToProfile} aria-label={t.profile}>👤</button>
        </div>
      </header>
      <section className="hero-card" aria-labelledby="welcome-title">
        <div className="hero-card__copy"><p className="eyebrow">{locale === 'uk' ? 'Твоя англійська — у твоєму темпі' : 'Твой английский — в твоём темпе'}</p><h1 id="welcome-title">{greeting}</h1><p className="hero-card__message">{locale === 'uk' ? 'Лис уже підготував маленький урок.' : 'Лис уже приготовил маленький урок.'}</p><button className="primary-button" type="button" onClick={() => onStartLesson(nextLesson.id)}><span>{t.continue}</span><span aria-hidden="true">→</span></button></div>
        <div className="hero-card__fox-wrap" aria-hidden="true"><span className="hero-card__orb hero-card__orb--one" /><span className="hero-card__orb hero-card__orb--two" /><CharacterMascot avatar={progress.avatar} size="large" mood="hello" /></div>
      </section>
      <section className="stats-grid" aria-label={locale === 'uk' ? 'Твій прогрес' : 'Твой прогресс'}>
        <article className="stat-card stat-card--goal"><div className="stat-card__icon">✦</div><div><p>{locale === 'uk' ? 'Мета на сьогодні' : 'Цель на сегодня'}</p><strong>{dailyGoal}/3</strong></div><div className="mini-progress"><span style={{ width: `${(dailyGoal / 3) * 100}%` }} /></div></article>
        <article className="stat-card"><div className="stat-card__icon stat-card__icon--teal">⚡</div><div><p>XP</p><strong>{progress.xp}</strong></div></article>
        <article className="stat-card"><div className="stat-card__icon">📚</div><div><p>{t.vocabulary}</p><button className="text-button" type="button" onClick={onNavigateToVocabulary}>{progress.learnedWordIds.length}</button></div></article>
      </section>
      {!premium && heartMinutes !== null && <p className="heart-timer">{t.nextHeart}: {Math.floor(heartMinutes / 60)}:{String(heartMinutes % 60).padStart(2, '0')}</p>}
      <section className="course-heading" aria-labelledby="course-title"><div><p className="eyebrow">{locale === 'uk' ? 'Стежка знань' : 'Тропа знаний'}</p><h2 id="course-title">{locale === 'uk' ? 'Твій маршрут' : 'Твой маршрут'}</h2></div><span className="course-heading__percent">{totalProgress}%</span></section>
      <div className="course-progress" aria-label={`${totalProgress}%`}><span style={{ width: `${totalProgress}%` }} /></div>
      <section className="module-list" aria-label={locale === 'uk' ? 'Модулі курсу' : 'Модули курса'}>
        {courseModules.map((module) => {
          const moduleLessons = lessons.filter((lesson) => lesson.moduleId === module.id);
          const completedCount = moduleLessons.filter((lesson) => progress.completedLessonIds.includes(lesson.id)).length;
          return <article className={`module-card module-card--${module.color}`} key={module.id}><div className="module-card__heading"><div className="module-card__icon" aria-hidden="true">{module.icon}</div><div><p className="module-card__kicker">{locale === 'uk' ? 'Модуль' : 'Модуль'} {courseModules.indexOf(module) + 1}</p><h3>{module.title}</h3><p>{module.subtitle}</p></div><span className="module-card__count">{completedCount}/{moduleLessons.length}</span></div><div className="lesson-steps">{moduleLessons.map((lesson) => { const completed = progress.completedLessonIds.includes(lesson.id); const unlocked = isLessonUnlocked(lesson.id, progress.completedLessonIds); const current = lesson.id === nextLesson.id; const statusText = completed ? (locale === 'uk' ? 'Пройдено' : 'Пройдено') : unlocked ? (current ? t.continue : t.startLesson) : '🔒'; return <button aria-label={`${lesson.title}: ${statusText}`} className={`lesson-step ${completed ? 'lesson-step--completed' : ''} ${current ? 'lesson-step--current' : ''}`} disabled={!unlocked} key={lesson.id} onClick={() => onStartLesson(lesson.id)}><span className="lesson-step__badge" aria-hidden="true">{completed ? '✓' : unlocked ? lesson.order : '🔒'}</span><span className="lesson-step__details"><strong>{lesson.title}</strong><small>{lesson.subtitle}</small></span><span className="lesson-step__state">{statusText}</span></button>; })}</div><span className="sr-only">{colorNames[module.color]}</span></article>;
        })}
      </section>
      <footer className="home-footer"><div className="fox-tip" role="note"><CharacterMascot avatar={progress.avatar} size="small" mood="think" /><p><strong>{locale === 'uk' ? 'Порада Лиса:' : 'Совет Лиса:'}</strong> {locale === 'uk' ? 'маленький урок щодня працює краще за рідкісні марафони.' : 'маленький урок каждый день полезнее редких марафонов.'}</p></div></footer>
    </main>
  );
}

export const getLessonTitle = (lessonId: string) => lessonById(lessonId)?.title ?? 'Урок';
