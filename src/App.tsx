import { useEffect, useMemo, useState } from 'react';
import { lessonById } from './content/course';
import { getLessonVocabulary } from './content/vocabulary';
import { CharacterCustomizer } from './components/CharacterCustomizer';
import { HomeScreen } from './components/HomeScreen';
import { LanguageScreen } from './components/LanguageScreen';
import { LessonScreen } from './components/LessonScreen';
import { NewWordsScreen } from './components/NewWordsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ResultScreen } from './components/ResultScreen';
import { VocabularyScreen } from './components/VocabularyScreen';
import { addLearnedWordIds, completeLesson, defaultAvatar, loadProgress, loseHeart, refillHearts, saveProgress } from './lib/progress';
import { fetchSubscription, isSubscriptionApiConfigured } from './lib/subscription';
import { getTelegramName, haptic, initializeTelegram } from './lib/telegram';
import type { AvatarConfig, LearningProgress, LessonResult, Locale } from './types';

type Screen = 'home' | 'lesson' | 'new-words' | 'result' | 'profile' | 'vocabulary' | 'customizer';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [progress, setProgress] = useState<LearningProgress>(() => loadProgress());
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [result, setResult] = useState<LessonResult | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const webApp = initializeTelegram();
    document.documentElement.dataset.theme = webApp?.colorScheme ?? 'light';
    setUserName(getTelegramName() ?? null);
  }, []);

  useEffect(() => {
    setProgress((current) => refillHearts(current));
  }, [screen]);

  useEffect(() => {
    if (!isSubscriptionApiConfigured()) return;
    void fetchSubscription().then((result) => {
      if (!result?.subscription) return;
      setProgress((current) => ({
        ...current,
        subscription: {
          isPremium: true,
          expiresAt: result.subscription?.expiresAt ?? null,
          purchasedAt: result.subscription?.purchasedAt ?? null,
          status: 'active',
        },
      }));
    });
  }, []);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const activeLesson = activeLessonId ? lessonById(activeLessonId) : undefined;
  const activeLocale = progress.locale;
  const activeWords = useMemo(() => activeLessonId ? getLessonVocabulary(activeLessonId) : [], [activeLessonId]);

  const chooseLocale = (locale: Locale) => {
    haptic.tap();
    setProgress((current) => ({ ...current, locale }));
  };

  const startLesson = (lessonId: string) => {
    if (!lessonById(lessonId) || !progress.locale) return;
    haptic.tap();
    setActiveLessonId(lessonId);
    setScreen('new-words');
  };

  const startQuestions = () => {
    haptic.tap();
    setScreen('lesson');
  };

  const exitLesson = () => {
    haptic.tap();
    setActiveLessonId(null);
    setScreen('home');
  };

  const handleLoseHeart = () => {
    setProgress((current) => loseHeart(current));
  };

  const finishLesson = (lessonResult: Omit<LessonResult, 'lessonId' | 'isNewCompletion'>) => {
    if (!activeLessonId) return;
    const completion = completeLesson(progress, activeLessonId, lessonResult.xpEarned);
    const nextProgress = addLearnedWordIds(completion.progress, activeWords.map((word) => word.id));
    setProgress(nextProgress);
    setResult({ lessonId: activeLessonId, ...lessonResult, isNewCompletion: completion.isNewCompletion });
    setScreen('result');
  };

  const returnHome = () => {
    haptic.tap();
    setActiveLessonId(null);
    setResult(null);
    setScreen('home');
  };

  const navigateTo = (next: Screen) => {
    haptic.tap();
    setScreen(next);
  };

  const saveAvatar = (avatar: AvatarConfig) => {
    setProgress((current) => ({ ...current, avatar }));
  };

  if (!activeLocale) return <LanguageScreen onSelect={chooseLocale} />;

  if (screen === 'new-words' && activeLesson) {
    return <NewWordsScreen locale={activeLocale} words={activeWords} onContinue={startQuestions} onExit={exitLesson} />;
  }

  if (screen === 'lesson' && activeLesson) {
    return (
      <LessonScreen
        lesson={activeLesson}
        locale={activeLocale}
        progress={progress}
        onLoseHeart={handleLoseHeart}
        onComplete={finishLesson}
        onExit={exitLesson}
      />
    );
  }

  if (screen === 'result' && result) {
    return <ResultScreen correctAnswers={result.correctAnswers} earnedXp={result.xpEarned} isNewCompletion={result.isNewCompletion} totalAnswers={result.totalAnswers} onContinue={returnHome} />;
  }

  if (screen === 'profile') {
    return <ProfileScreen progress={progress} userName={userName} locale={activeLocale} onNavigateHome={returnHome} onNavigateVocabulary={() => navigateTo('vocabulary')} onCustomize={() => navigateTo('customizer')} onChangeLanguage={() => setProgress((current) => ({ ...current, locale: null }))} />;
  }

  if (screen === 'vocabulary') {
    return <VocabularyScreen progress={progress} locale={activeLocale} onNavigateHome={returnHome} />;
  }

  if (screen === 'customizer') {
    return <CharacterCustomizer locale={activeLocale} value={progress.avatar ?? defaultAvatar} onSave={saveAvatar} onClose={() => navigateTo('profile')} />;
  }

  return <HomeScreen progress={progress} userName={userName} locale={activeLocale} onStartLesson={startLesson} onNavigateToProfile={() => navigateTo('profile')} onNavigateToVocabulary={() => navigateTo('vocabulary')} />;
}
