import { StepConfig } from './types';

export const ONBOARDING_STEPS: StepConfig[] = [
  {
    id: 'language',
    type: 'single-choice',
    field: 'language',
    questionEn: 'What language is comfortable for preparing?',
    questionRu: 'На каком языке удобно готовиться?',
    options: [
      { value: 'en', labelEn: 'English', labelRu: 'Английский' },
      { value: 'ru', labelEn: 'Russian', labelRu: 'Русский' },
    ],
  },
  {
    id: 'role',
    type: 'single-choice',
    field: 'role',
    questionEn: 'Who are you?',
    questionRu: 'Кто вы?',
    options: [
      { value: 'school', labelEn: 'School student', labelRu: 'Школьник' },
      { value: 'college', labelEn: 'College student', labelRu: 'Студент' },
      { value: 'working', labelEn: 'Working', labelRu: 'Работаю' },
    ],
  },
  {
    id: 'source',
    type: 'single-choice',
    field: 'source',
    questionEn: 'How did you hear about us?',
    questionRu: 'Как вы о нас узнали?',
    options: [
      { value: 'tiktok', labelEn: 'TikTok', labelRu: 'TikTok' },
      { value: 'instagram', labelEn: 'Instagram', labelRu: 'Instagram' },
      { value: 'app_store', labelEn: 'App Store', labelRu: 'App Store' },
      { value: 'play_market', labelEn: 'Play Market', labelRu: 'Play Market' },
      { value: 'friend', labelEn: 'From a friend', labelRu: 'От знакомого' },
    ],
  },
  {
    id: 'tried-before',
    type: 'single-choice',
    field: 'triedBefore',
    questionEn: 'Have you tried other SAT prep before?',
    questionRu: 'Пробовали ли вы другую подготовку к SAT раньше?',
    options: [
      { value: 'true', labelEn: 'Yes', labelRu: 'Да' },
      { value: 'false', labelEn: 'No', labelRu: 'Нет' },
    ],
  },
  { id: 'exam-date', type: 'exam-date' },
  { id: 'study-days', type: 'study-days' },
  { id: 'study-intensity', type: 'study-intensity' },
  // Прошлый результат спрашиваем только у тех, кто уже сдавал (фильтр в OnboardingFlow).
  { id: 'score-previous', type: 'score', mode: 'previous' },
  // Желаемый результат — у всех.
  { id: 'score-target', type: 'score', mode: 'target' },
];