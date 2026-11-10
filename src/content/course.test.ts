import { describe, expect, it } from 'vitest';
import { isLessonUnlocked, lessons } from './course';

describe('course progression', () => {
  it('unlocks the first lesson by default', () => {
    expect(isLessonUnlocked(lessons[0].id, [])).toBe(true);
  });

  it('requires the immediately preceding lesson for later lessons', () => {
    expect(isLessonUnlocked(lessons[1].id, [])).toBe(false);
    expect(isLessonUnlocked(lessons[1].id, [lessons[0].id])).toBe(true);
  });

  it('unlocks lessons sequentially', () => {
    expect(isLessonUnlocked(lessons[2].id, [lessons[0].id, lessons[1].id])).toBe(true);
  });
});
