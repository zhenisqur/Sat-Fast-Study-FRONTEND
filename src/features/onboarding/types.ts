export type PreparationLanguage = 'en' | 'ru';
export type UserRole = 'school' | 'college' | 'working';
export type AcquisitionSource =
  | 'tiktok'
  | 'instagram'
  | 'app_store'
  | 'play_market'
  | 'friend';
export type StudyIntensity = 'light' | 'medium' | 'intense';
export type ExamTimeframe = 'soon' | 'half_year' | 'year' | 'undecided';

export interface OnboardingAnswers {
  language: PreparationLanguage | null;
  role: UserRole | null;
  source: AcquisitionSource | null;
  triedBefore: boolean | null;
  examTimeframe: ExamTimeframe | null;
  studyDays: string[]; // ['mon', 'wed', 'fri']
  intensity: StudyIntensity | null;
}

export const initialOnboardingAnswers: OnboardingAnswers = {
  language: null,
  role: null,
  source: null,
  triedBefore: null,
  examTimeframe: null,
  studyDays: [],
  intensity: null,
};

export type SingleChoiceField = 'language' | 'role' | 'source' | 'triedBefore' | 'examTimeframe';

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

export type StepConfig =
  | SingleChoiceStepConfig
  | { id: 'study-days'; type: 'study-days' };