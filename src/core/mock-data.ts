import { Lesson, Question, Section, StudyProgress } from './types';

const math: Question[] = [
  { id: 'math-1', stem: 'Solve for x: 2x + 4 = 10', choices: [{ id: 'A', text: 'x = 2' }, { id: 'B', text: 'x = 3' }, { id: 'C', text: 'x = 4' }, { id: 'D', text: 'x = 6' }], explanation: 'Subtract 4 from both sides: 2x = 6. Divide both sides by 2, so x = 3.' },
  { id: 'math-2', stem: 'What is 25% of 80?', choices: [{ id: 'A', text: '5' }, { id: 'B', text: '20' }, { id: 'C', text: '25' }, { id: 'D', text: '32' }], explanation: '25% is one quarter. 80 ÷ 4 = 20.' },
  { id: 'math-3', stem: 'A line has slope 3 and crosses the y-axis at −2. Which equation represents it?', choices: [{ id: 'A', text: 'y = 3x − 2' }, { id: 'B', text: 'y = −2x + 3' }, { id: 'C', text: 'y = 3x + 2' }, { id: 'D', text: 'y = −3x − 2' }], explanation: 'Use y = mx + b. The slope is 3 and the y-intercept is −2.' },
];

const readingWriting: Question[] = [
  { id: 'rw-1', stem: 'The students prepared carefully; _____, they felt confident on test day.', choices: [{ id: 'A', text: 'however' }, { id: 'B', text: 'therefore' }, { id: 'C', text: 'meanwhile' }, { id: 'D', text: 'for example' }], explanation: 'The confidence is a result of preparation, so “therefore” is the logical transition.' },
  { id: 'rw-2', stem: 'The scientist’s findings were so _____ that they changed how the field understood the problem.', choices: [{ id: 'A', text: 'ordinary' }, { id: 'B', text: 'tentative' }, { id: 'C', text: 'significant' }, { id: 'D', text: 'unrelated' }], explanation: 'Findings that change an entire field are significant.' },
  { id: 'rw-3', stem: 'Maya packed three essentials _____ a notebook, a water bottle, and headphones.', choices: [{ id: 'A', text: ',' }, { id: 'B', text: ':' }, { id: 'C', text: ';' }, { id: 'D', text: '—' }], explanation: 'A colon correctly introduces the list after an independent clause.' },
];

export const practiceQuestions = (section: Section): Question[] => {
  const seed = section === 'MATH' ? math : readingWriting;
  return Array.from({ length: 15 }, (_, index) => ({ ...seed[index % seed.length], id: `${seed[index % seed.length].id}-${index + 1}` }));
};

export const mockCorrectAnswer = (id: string) => {
  if (id.startsWith('math-1')) return 'B';
  if (id.startsWith('math-2')) return 'B';
  if (id.startsWith('math-3')) return 'A';
  if (id.startsWith('rw-1')) return 'B';
  if (id.startsWith('rw-2')) return 'C';
  return 'B';
};

export const makeLesson = (level: number, section: Section): Lesson => {
  const topics = section === 'MATH'
    ? ['Linear equations', 'Ratios and percentages', 'Functions', 'Systems of equations', 'Quadratic expressions']
    : ['Transitions', 'Words in context', 'Punctuation', 'Rhetorical synthesis', 'Text structure'];
  const title = topics[(level - 1) % topics.length];
  const quizSeed = (section === 'MATH' ? math : readingWriting).map((item, index) => ({ ...item, id: `study-${item.id}-${level}-${index}` }));
  return {
    level, section, title, quizzes: quizSeed,
    explanation: section === 'MATH'
      ? `This lesson builds your ${title.toLowerCase()} toolkit. Identify the relationship you know, then work one clear step at a time.`
      : `This lesson builds your ${title.toLowerCase()} toolkit. Read the surrounding text first, then choose the option that preserves the author’s meaning and grammar.`,
    example: section === 'MATH' ? 'Example: 3x − 5 = 16 → 3x = 21 → x = 7.' : 'Example: “The data were incomplete; therefore, the result was uncertain.”',
  };
};

export const initialStudyProgress = (): StudyProgress[] => Array.from({ length: 45 }, (_, index) => ({
  level: index + 1,
  math: { completed: index === 0 },
  readingWriting: { completed: index === 0 },
}));
