import { beforeEach, describe, expect, it } from 'vitest';
import { getDailyGoalProgress, getLocalDateKey, loadProgress, PROGRESS_STORAGE_KEY, registerStudyDay, completeLesson, defaultProgress, loseHeart, refillHearts, MAX_HEARTS } from './progress';

describe('learning progress', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts safely when no local data exists', () => {
    expect(loadProgress()).toEqual(defaultProgress);
  });

  it('starts a streak on the first learning day', () => {
    const result = registerStudyDay(defaultProgress, '2026-11-08');
    expect(result.streak).toBe(1);
    expect(result.lastStudyDate).toBe('2026-11-08');
  });

  it('continues a streak only on the next calendar day', () => {
    const yesterday = { ...defaultProgress, streak: 4, lastStudyDate: '2026-11-07' };
    expect(registerStudyDay(yesterday, '2026-11-08').streak).toBe(5);
    expect(registerStudyDay(yesterday, '2026-11-10').streak).toBe(1);
  });

  it('awards XP only once for a newly completed lesson', () => {
    const first = completeLesson(defaultProgress, 'hello-1', 24, '2026-11-08');
    const second = completeLesson(first.progress, 'hello-1', 24, '2026-11-08');

    expect(first.isNewCompletion).toBe(true);
    expect(first.progress.xp).toBe(24);
    expect(second.isNewCompletion).toBe(false);
    expect(second.progress.xp).toBe(24);
  });

  it('keeps daily goal progress bounded', () => {
    const progress = { ...defaultProgress, completedLessonIds: ['a', 'b', 'c', 'd', 'e'], lastStudyDate: getLocalDateKey() };
    expect(getDailyGoalProgress(progress)).toBeLessThanOrEqual(3);
  });

  it('ignores malformed saved data', () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, '{ malformed json');
    expect(loadProgress()).toEqual(defaultProgress);
  });

  it('migrates old progress to five hearts and a locale slot', () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ completedLessonIds: ['hello-1'], xp: 10, streak: 1, lastStudyDate: null }));
    const result = loadProgress();
    expect(result.hearts).toBe(MAX_HEARTS);
    expect(result.locale).toBeNull();
    expect(result.learnedWordIds).toEqual([]);
  });

  it('loses one heart for a free user but not for Premium', () => {
    expect(loseHeart(defaultProgress).hearts).toBe(4);
    const premium = { ...defaultProgress, subscription: { ...defaultProgress.subscription, isPremium: true } };
    expect(loseHeart(premium).hearts).toBe(MAX_HEARTS);
  });

  it('refills a heart after one hour', () => {
    const lostAt = new Date('2026-11-10T10:00:00.000Z').toISOString();
    const progress = { ...defaultProgress, hearts: 4, lastHeartLoss: lostAt };
    expect(refillHearts(progress, new Date('2026-11-10T11:01:00.000Z')).hearts).toBe(5);
  });
});
