export type Locale = 'ru' | 'uk';
export type AnimalKind = 'fox' | 'cat' | 'panda' | 'rabbit' | 'owl';
export type AvatarColor = 'sunset' | 'mint' | 'berry' | 'sky';
export type AvatarAccessory = 'none' | 'glasses' | 'scarf' | 'crown';
export type AvatarExpression = 'happy' | 'calm' | 'excited';
export type ExerciseKind = 'choice' | 'build' | 'fill' | 'audio';

export interface ChoiceExercise {
  id: string;
  kind: 'choice';
  prompt: string;
  promptHint?: string;
  options: string[];
  answer: string;
  note: string;
}

export interface BuildExercise {
  id: string;
  kind: 'build';
  prompt: string;
  promptHint?: string;
  tokens: string[];
  answer: string[];
  note: string;
}

export interface FillExercise {
  id: string;
  kind: 'fill';
  prompt: string;
  promptHint?: string;
  sentence: string;
  options: string[];
  answer: string;
  note: string;
}

export interface AudioExercise {
  id: string;
  kind: 'audio';
  prompt: string;
  promptHint?: string;
  phrase: string;
  translation: string;
  options: string[];
  answer: string;
  note: string;
  speaker: AnimalKind;
}

export type Exercise = ChoiceExercise | BuildExercise | FillExercise | AudioExercise;

export interface VocabularyWord {
  id: string;
  english: string;
  russian: string;
  ukrainian: string;
  transcription?: string;
  example?: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  subtitle: string;
  icon: string;
  exercises: Exercise[];
}

export interface CourseModule {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: 'coral' | 'teal' | 'berry' | 'gold';
}

export interface AvatarConfig {
  animal: AnimalKind;
  color: AvatarColor;
  accessory: AvatarAccessory;
  expression: AvatarExpression;
}

export interface LearningProgress {
  completedLessonIds: string[];
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  subscription: Subscription;
  hearts: number;
  lastHeartLoss: string | null;
  learnedWordIds: string[];
  locale: Locale | null;
  avatar: AvatarConfig;
}

export interface Subscription {
  isPremium: boolean;
  expiresAt: string | null;
  purchasedAt: string | null;
  status?: 'local' | 'pending' | 'active';
}

export interface LessonResult {
  lessonId: string;
  correctAnswers: number;
  totalAnswers: number;
  xpEarned: number;
  isNewCompletion: boolean;
}
