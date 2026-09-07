export type Section = 'MATH' | 'READING_WRITING';
export type Tab = 'HOME' | 'STUDY' | 'PRACTICE' | 'PROFILE';

export type User = {
  id: string;
  email: string;
  fullName: string;
  age: number;
  hasTakenSatBefore: boolean;
  previousSatScore?: number | null;
  targetScore?: number | null;
  role?: string;
};

export type Choice = { id: string; text: string };

export type Question = {
  id: string;
  stem: string;
  choices: Choice[];
  explanation?: string;
  imageUrl?: string | null;
};

export type Progress = {
  math: { level: number; of: number };
  readingWriting: { level: number; of: number };
  overall: { level: number; of: number };
};

export type DailyQuota = { math: number; readingWriting: number };

export type StudyProgress = {
  level: number;
  math: { completed: boolean };
  readingWriting: { completed: boolean };
};

export type Lesson = {
  level: number;
  section: Section;
  title: string;
  explanation: string;
  example: string;
  quizzes: Question[];
};

export type AuthPayload = {
  email: string;
  password: string;
  fullName?: string;
  age?: number;
  hasTakenSatBefore?: boolean;
  previousSatScore?: number;
};

export type AuthSession = { accessToken: string; user: User };

// ---------- STUDY (sequential 30-level path, math+grammar tabs) ----------

export type StudyTab = 'math' | 'grammar';

export type StudyPathNode = {
  sequenceLevel: number;
  mathTopic: string;
  grammarTopic: string | null;
  hasGrammarTab: boolean;
  status: 'completed' | 'current' | 'locked';
};

export type StudyPath = {
  currentSequenceLevel: number;
  totalLevels: number;
  mathTabDone: boolean;
  grammarTabDone: boolean;
  nodes: StudyPathNode[];
};

export type LessonScenario = {
  id: string;
  domain: string;
  domainLevel: number;
  order: number;
  title: string;
  content: string;
};

export type StudyLevelContent = {
  sequenceLevel: number;
  tab: StudyTab;
  domain: string;
  topic: string;
  scenarios: LessonScenario[];
  quiz: Question[];
};

export type StudyAnswerResult = {
  correct: boolean;
  correctChoice: string | null;
  explanation: string | null;
  tabCompleted: boolean;
  leveledUp: boolean;
};

export type PracticeAnswerResult = {
  correctness: 'CORRECT' | 'INCORRECT';
  leveledUp: boolean;
  quota: { mathAnswered: number; rwAnswered: number; mathTarget: number; rwTarget: number; completed: boolean };
  correctChoice: string | null;
  explanation: string | null;
};

export type RawDailyQuota = {
  mathAnswered: number;
  rwAnswered: number;
  mathTarget: number;
  rwTarget: number;
  completed: boolean;
};
