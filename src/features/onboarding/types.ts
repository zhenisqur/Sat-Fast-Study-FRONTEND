export type PreparationLanguage = 'en' | 'ru';
export type UserRole = 'school' | 'college' | 'working';
export type AcquisitionSource = 'tiktok' | 'instagram' | 'app_store' | 'play_market' | 'friend';
export type StudyIntensity = 'light' | 'regular' | 'serious' | 'intense';

export interface OnboardingAnswers {
  language: PreparationLanguage | null;
  role: UserRole | null;
  source: AcquisitionSource | null;
  triedBefore: boolean | null;
  examDate: string | null; // ISO date string, e.g. "2027-02-14", или null если "ещё не определился"
  studyDays: string[];
  intensity: StudyIntensity | null;
  // Баллы по секциям (каждая 200–800)
  previousMath: number | null;
  previousReading: number | null; // «Грамматика» (Reading & Writing)
  targetMath: number | null;
  targetReading: number | null;
  // Суммы (400–1600). Считаются из секций — на них завязаны paywall и регистрация.
  previousScore: number | null;
  targetScore: number | null;
}

export const initialOnboardingAnswers: OnboardingAnswers = {
  language: null,
  role: null,
  source: null,
  triedBefore: null,
  examDate: null,
  studyDays: [],
  intensity: null,
  previousMath: null,
  previousReading: null,
  targetMath: null,
  targetReading: null,
  previousScore: null,
  targetScore: null,
};

export type SingleChoiceField = 'language' | 'role' | 'source' | 'triedBefore';

export interface SingleChoiceOption {
  value: string;
  labelEn: string;
  labelRu: string;
}

export interface SingleChoiceStepConfig {
  id: string;
  type: 'single-choice';
  field: SingleChoiceField;
  questionEn: string;
  questionRu: string;
  options: SingleChoiceOption[];
}

export type ScoreMode = 'previous' | 'target';

export type StepConfig =
  | SingleChoiceStepConfig
  | { id: 'exam-date'; type: 'exam-date' }
  | { id: 'study-days'; type: 'study-days' }
  | { id: 'study-intensity'; type: 'study-intensity' }
  | { id: 'score-previous'; type: 'score'; mode: 'previous' }
  | { id: 'score-target'; type: 'score'; mode: 'target' };