import { API_URL, DEMO_MODE } from '../core/config';
import { initialStudyProgress, makeLesson, mockCorrectAnswer, practiceQuestions } from '../core/mock-data';
import {
  AuthPayload,
  AuthSession,
  DailyQuota,
  PracticeAnswerResult,
  Progress,
  Question,
  RawDailyQuota,
  Section,
  StudyAnswerResult,
  StudyLevelContent,
  StudyPath,
  StudyTab,
  User,
} from '../core/types';

export class ApiError extends Error {
  constructor(message: string, public status?: number) { super(message); }
}

const demoUser = (payload?: AuthPayload): User => ({
  id: 'demo-user', email: payload?.email ?? 'aidan@example.com', fullName: payload?.fullName ?? 'Aidan Smith',
  age: payload?.age ?? 17, hasTakenSatBefore: payload?.hasTakenSatBefore ?? true,
  previousSatScore: payload?.previousSatScore ?? 1250, targetScore: 1450, role: 'STUDENT',
});

let demoStudyProgress = initialStudyProgress();

const normalizeQuestion = (item: any): Question => ({
  id: String(item.id), stem: String(item.stem ?? item.question ?? ''), explanation: item.explanation, imageUrl: item.imageUrl,
  choices: Array.isArray(item.choices)
    ? item.choices.map((choice: any, index: number) => ({ id: String(choice.id ?? String.fromCharCode(65 + index)), text: String(choice.text ?? choice.value ?? choice) }))
    : ['A', 'B', 'C', 'D'].filter((key) => item[`choice${key}`] !== undefined).map((key) => ({ id: key, text: String(item[`choice${key}`]) })),
});

const errorMessage = async (response: Response) => {
  try {
    const body = await response.json();
    return Array.isArray(body.message) ? body.message[0] : body.message ?? 'Something went wrong. Please try again.';
  } catch { return 'Something went wrong. Please try again.'; }
};

// Backend RegisterDto uses different field names than the frontend AuthPayload
// (hasTakenSat/previousScore, not hasTakenSatBefore/previousSatScore) — translate
// here so the UI/state naming can stay stable even if the backend contract shifts.
export const authenticate = async (mode: 'LOGIN' | 'REGISTER', payload: AuthPayload): Promise<AuthSession> => {
  if (DEMO_MODE) return { accessToken: 'demo-access-token', user: demoUser(payload) };

  const body: any = { email: payload.email, password: payload.password };
  if (mode === 'REGISTER') {
    body.fullName = payload.fullName;
    body.age = payload.age;
    body.hasTakenSat = payload.hasTakenSatBefore;
    body.previousScore = payload.previousSatScore;
  }

  const response = await fetch(`${API_URL}${mode === 'LOGIN' ? '/auth/login' : '/auth/register'}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!response.ok) throw new ApiError(await errorMessage(response), response.status);
  return response.json();
};

export const oauthAuthenticate = async (
  provider: 'GOOGLE' | 'APPLE',
  payload: { idToken?: string; identityToken?: string; fullName?: string },
): Promise<AuthSession> => {
  if (DEMO_MODE) return { accessToken: 'demo-access-token', user: demoUser() };
  const endpoint = provider === 'GOOGLE' ? '/auth/google' : '/auth/apple';
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  if (!response.ok) throw new ApiError(await errorMessage(response), response.status);
  return response.json();
};

export const createApi = (token: string, onUnauthorized: () => void) => {
  const request = async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers } });
    if (response.status === 401) { onUnauthorized(); throw new ApiError('Your session ended. Please sign in again.', 401); }
    if (!response.ok) throw new ApiError(await errorMessage(response), response.status);
    return response.json() as Promise<T>;
  };

  return {
    isDemo: DEMO_MODE,

    getDashboard: async (): Promise<{ progress: Progress; quota: DailyQuota }> => {
      if (DEMO_MODE) return { progress: { math: { level: 7, of: 50 }, readingWriting: { level: 5, of: 50 }, overall: { level: 12, of: 100 } }, quota: { math: 12, readingWriting: 8 } };
      const [progress, rawQuota] = await Promise.all([
        request<Progress>('/levels/progress'),
        request<RawDailyQuota>('/levels/daily-quota/today'),
      ]);
      return { progress, quota: { math: rawQuota.mathAnswered, readingWriting: rawQuota.rwAnswered } };
    },

    getProfile: async (): Promise<User> => {
      if (DEMO_MODE) return demoUser();
      const raw = await request<any>('/users/me');
      return {
      id: raw.id,
      email: raw.email,
      fullName: raw.fullName,
      age: raw.age ?? 0,
      hasTakenSatBefore: raw.hasTakenSat ?? false,
      previousSatScore: raw.previousScore ?? null,
      targetScore: raw.targetScore ?? null,
      role: raw.role,
  };
},

    getQuestions: async (section: Section): Promise<Question[]> =>
      DEMO_MODE ? practiceQuestions(section) : (await request<any[]>(`/levels/questions?section=${section}`)).map(normalizeQuestion),

    submitAnswer: async (section: Section, questionId: string, userAnswer: string, timeSpentSec: number): Promise<PracticeAnswerResult> => {
      if (DEMO_MODE) {
        const correct = mockCorrectAnswer(questionId) === userAnswer;
        return {
          correctness: correct ? 'CORRECT' : 'INCORRECT',
          leveledUp: questionId.endsWith('-15'),
          quota: { mathAnswered: 0, rwAnswered: 0, mathTarget: 15, rwTarget: 15, completed: false },
          correctChoice: correct ? null : 'A',
          explanation: correct ? null : 'Demo explanation.',
        };
      }
      return request<PracticeAnswerResult>(`/levels/daily-quota/${section}/answer`, {
        method: 'POST',
        body: JSON.stringify({ questionId, userAnswer, timeSpentSec }),
      });
    },

    getStudyPath: async (): Promise<StudyPath> => {
      if (DEMO_MODE) {
        return {
          currentSequenceLevel: 3,
          totalLevels: 30,
          mathTabDone: false,
          grammarTabDone: true,
          nodes: demoStudyProgress.map((item, index) => ({
            sequenceLevel: item.level,
            mathTopic: `Demo Math Topic ${item.level}`,
            grammarTopic: item.level <= 15 ? `Demo Grammar Topic ${item.level}` : null,
            hasGrammarTab: item.level <= 15,
            status: index < 2 ? 'completed' : index === 2 ? 'current' : 'locked',
          })),
        };
      }
      return request<StudyPath>('/study/path');
    },

    getStudyLevel: async (sequenceLevel: number, tab: StudyTab): Promise<StudyLevelContent> => {
      if (DEMO_MODE) {
        const lesson = makeLesson(sequenceLevel, tab === 'math' ? 'MATH' : 'READING_WRITING');
        return {
          sequenceLevel,
          tab,
          domain: 'demo',
          topic: lesson.title,
          scenarios: [
            { id: 's1', domain: 'demo', domainLevel: sequenceLevel, order: 1, title: lesson.title, content: lesson.explanation },
            { id: 's2', domain: 'demo', domainLevel: sequenceLevel, order: 2, title: 'Example', content: lesson.example },
            { id: 's3', domain: 'demo', domainLevel: sequenceLevel, order: 3, title: 'Recap', content: lesson.explanation },
          ],
          quiz: lesson.quizzes.map(normalizeQuestion),
        };
      }
      const content = await request<any>(`/study/level/${sequenceLevel}/${tab}`);
      return { ...content, quiz: content.quiz.map(normalizeQuestion) };
    },

    submitStudyAnswer: async (sequenceLevel: number, tab: StudyTab, questionId: string, userAnswer: string): Promise<StudyAnswerResult> => {
      if (DEMO_MODE) {
        const correct = mockCorrectAnswer(questionId.replace(/^study-/, '').replace(/-\d+-\d+$/, '')) === userAnswer;
        return { correct, correctChoice: correct ? null : 'A', explanation: correct ? null : 'Demo explanation.', tabCompleted: false, leveledUp: false };
      }
      return request<StudyAnswerResult>(`/study/level/${sequenceLevel}/${tab}/answer`, {
        method: 'POST',
        body: JSON.stringify({ questionId, userAnswer }),
      });
    },
  };
};

export type Api = ReturnType<typeof createApi>;