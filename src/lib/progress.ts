import type { AvatarConfig, LearningProgress, Locale } from '../types';

export const PROGRESS_STORAGE_KEY = 'lingo-fox-progress-v1';
export const MAX_HEARTS = 5;
export const HEART_REFILL_HOURS = 1;

export const defaultAvatar: AvatarConfig = {
  animal: 'fox',
  color: 'sunset',
  accessory: 'none',
  expression: 'happy',
};

export const defaultProgress: LearningProgress = {
  completedLessonIds: [],
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  subscription: {
    isPremium: false,
    expiresAt: null,
    purchasedAt: null,
    status: 'local',
  },
  hearts: MAX_HEARTS,
  lastHeartLoss: null,
  learnedWordIds: [],
  locale: null,
  avatar: defaultAvatar,
};

const isLocale = (value: unknown): value is Locale => value === 'ru' || value === 'uk';

const normalizeProgress = (value: unknown): LearningProgress => {
  const raw = (value && typeof value === 'object' ? value : {}) as Partial<LearningProgress> & {
    learnedWords?: unknown;
  };
  const subscription = raw.subscription && typeof raw.subscription === 'object'
    ? raw.subscription
    : defaultProgress.subscription;

  return {
    ...defaultProgress,
    ...raw,
    completedLessonIds: Array.isArray(raw.completedLessonIds)
      ? raw.completedLessonIds.filter((id): id is string => typeof id === 'string')
      : [],
    xp: typeof raw.xp === 'number' && Number.isFinite(raw.xp) ? Math.max(0, raw.xp) : 0,
    streak: typeof raw.streak === 'number' && Number.isFinite(raw.streak) ? Math.max(0, raw.streak) : 0,
    lastStudyDate: typeof raw.lastStudyDate === 'string' ? raw.lastStudyDate : null,
    subscription: {
      ...defaultProgress.subscription,
      ...subscription,
      isPremium: subscription.isPremium === true,
      expiresAt: typeof subscription.expiresAt === 'string' ? subscription.expiresAt : null,
      purchasedAt: typeof subscription.purchasedAt === 'string' ? subscription.purchasedAt : null,
      status: subscription.status === 'pending' || subscription.status === 'active' ? subscription.status : 'local',
    },
    hearts: typeof raw.hearts === 'number' && Number.isFinite(raw.hearts)
      ? Math.min(MAX_HEARTS, Math.max(0, Math.floor(raw.hearts)))
      : MAX_HEARTS,
    lastHeartLoss: typeof raw.lastHeartLoss === 'string' ? raw.lastHeartLoss : null,
    learnedWordIds: Array.isArray(raw.learnedWordIds)
      ? raw.learnedWordIds.filter((id): id is string => typeof id === 'string')
      : Array.isArray(raw.learnedWords)
        ? raw.learnedWords.filter((word): word is string => typeof word === 'string')
        : [],
    locale: isLocale(raw.locale) ? raw.locale : null,
    avatar: {
      ...defaultAvatar,
      ...(raw.avatar && typeof raw.avatar === 'object' ? raw.avatar : {}),
    },
  };
};

export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPreviousDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const previous = new Date(year, month - 1, day - 1);
  return getLocalDateKey(previous);
};

export const loadProgress = (): LearningProgress => {
  if (typeof window === 'undefined') return defaultProgress;

  try {
    const stored = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    return stored ? refillHearts(normalizeProgress(JSON.parse(stored))) : defaultProgress;
  } catch {
    return defaultProgress;
  }
};

export const saveProgress = (progress: LearningProgress) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(normalizeProgress(progress)));
};

export const refillHearts = (progress: LearningProgress, now = new Date()): LearningProgress => {
  if (progress.subscription.isPremium || progress.hearts >= MAX_HEARTS || !progress.lastHeartLoss) {
    return progress;
  }

  const hoursPassed = Math.floor((now.getTime() - new Date(progress.lastHeartLoss).getTime()) / (1000 * 60 * 60));
  if (hoursPassed < HEART_REFILL_HOURS) return progress;

  const hearts = Math.min(MAX_HEARTS, progress.hearts + Math.floor(hoursPassed / HEART_REFILL_HOURS));
  return {
    ...progress,
    hearts,
    lastHeartLoss: hearts >= MAX_HEARTS ? null : new Date(now.getTime() - ((hoursPassed % HEART_REFILL_HOURS) * 60 * 60 * 1000)).toISOString(),
  };
};

export const loseHeart = (progress: LearningProgress): LearningProgress => {
  if (progress.subscription.isPremium || progress.hearts <= 0) return progress;
  return { ...progress, hearts: progress.hearts - 1, lastHeartLoss: new Date().toISOString() };
};

export const registerStudyDay = (progress: LearningProgress, dateKey = getLocalDateKey()): LearningProgress => {
  if (progress.lastStudyDate === dateKey) return progress;
  const yesterday = getPreviousDateKey(dateKey);
  return {
    ...progress,
    streak: progress.lastStudyDate === yesterday ? progress.streak + 1 : 1,
    lastStudyDate: dateKey,
  };
};

export const completeLesson = (progress: LearningProgress, lessonId: string, earnedXp: number, dateKey = getLocalDateKey()) => {
  const datedProgress = registerStudyDay(progress, dateKey);
  const isNewCompletion = !datedProgress.completedLessonIds.includes(lessonId);
  return {
    isNewCompletion,
    progress: {
      ...datedProgress,
      completedLessonIds: isNewCompletion ? [...datedProgress.completedLessonIds, lessonId] : datedProgress.completedLessonIds,
      xp: isNewCompletion ? datedProgress.xp + earnedXp : datedProgress.xp,
    },
  };
};

export const addLearnedWordIds = (progress: LearningProgress, wordIds: string[]) => ({
  ...progress,
  learnedWordIds: [...new Set([...progress.learnedWordIds, ...wordIds])],
});

export const getDailyGoalProgress = (progress: LearningProgress) => {
  const base = progress.lastStudyDate === getLocalDateKey() ? 3 : 0;
  return Math.min(base + (progress.completedLessonIds.length % 3), 3);
};

export const getTimeUntilNextHeart = (progress: LearningProgress, now = new Date()): number | null => {
  if (progress.subscription.isPremium || progress.hearts >= MAX_HEARTS || !progress.lastHeartLoss) return null;
  const elapsed = now.getTime() - new Date(progress.lastHeartLoss).getTime();
  return Math.max(0, Math.ceil((HEART_REFILL_HOURS * 60 * 60 * 1000 - (elapsed % (HEART_REFILL_HOURS * 60 * 60 * 1000))) / 60000));
};
