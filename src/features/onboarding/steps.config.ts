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
  {
    id: 'exam-timeframe',
    type: 'single-choice',
    field: 'examTimeframe',
    questionEn: 'When are you planning to take the SAT?',
    questionRu: 'Когда примерно планируешь сдавать SAT?',
    options: [
      { value: 'soon', labelEn: 'In the next 3 months', labelRu: 'В ближайшие 3 месяца' },
      { value: 'half_year', labelEn: 'In about 6 months', labelRu: 'Через полгода' },
      { value: 'year', labelEn: 'In about a year', labelRu: 'Через год' },
      { value: 'undecided', labelEn: "Haven't decided yet", labelRu: 'Ещё не решил(-а)' },
    ],
  },
  { id: 'study-days', type: 'study-days' },
];