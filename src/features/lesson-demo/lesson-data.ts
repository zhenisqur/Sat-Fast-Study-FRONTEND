import { Section } from '../../core/types';

/** Часть задания: текст, пропуск (null) или перенос строки ('\n'). */
export type Part = string | null;

export type Explain = {
  /** Короткое правило, которое показывается в заголовке карточки. */
  rule: string;
  paragraphs: string[];
  examples: string[];
};

/**
 * Два вида заданий:
 *  - fill: предложение или решение с пропусками. Слова (или числа) из банка внизу ставятся в пропуски по порядку.
 *    Математика решается по шагам: пропусков может быть несколько, как строки в тетради.
 *  - choice: вопрос с вариантами ответа A-D (для заданий с длинным текстом).
 */
export type Question =
  | {
      kind: 'fill';
      title: string;
      parts: Part[];
      options: string[];
      /** Для каждого пропуска по порядку: индекс правильного слова в options. */
      answers: number[];
      explain: Explain;
    }
  | {
      kind: 'choice';
      title: string;
      text: string;
      options: string[];
      /** Индекс правильного варианта в options. */
      answer: number;
      explain: Explain;
    };

export type LessonStatus = 'idle' | 'correct' | 'wrong';

/** Правильные ответы по пропускам (для choice это один элемент). */
export const answersOf = (question: Question): number[] =>
  question.kind === 'fill' ? question.answers : [question.answer];

/** Пустые выборы под каждый пропуск задания. */
export const emptyPicks = (question: Question): (number | null)[] => answersOf(question).map(() => null);

export const MATH_QUESTIONS: Question[] = [
  {
    kind: 'fill',
    title: 'Заполни пропуски',
    parts: ['3x + 7 = 22', '\n', '3x =', null, '\n', 'x =', null],
    options: ['5', '29', '15', '3'],
    answers: [2, 0],
    explain: {
      rule: '3x + 7 = 22',
      paragraphs: ['Сначала вычитаем 7 из обеих частей: 3x = 15.', 'Потом делим обе части на 3: x = 5.'],
      examples: ['3 · 5 + 7 = 22'],
    },
  },
  {
    kind: 'fill',
    title: 'Заполни пропуски',
    parts: ['20% от 150', '\n', '20% =', null, '\n', 'x =', null],
    options: ['2', '30', '0.2', '300'],
    answers: [2, 1],
    explain: {
      rule: 'Процент от числа',
      paragraphs: ['20% это 0.2. Умножаем: 0.2 · 150 = 30.', 'Можно проще: 10% от 150 это 15, а 20% в два раза больше.'],
      examples: ['10% от 150 = 15', '20% от 150 = 30'],
    },
  },
  {
    kind: 'fill',
    title: 'Заполни пропуски',
    parts: ['Прямая через (0, 4) и (2, 10)', '\n', '10 − 4 =', null, '\n', '2 − 0 =', null, '\n', 'slope =', null],
    options: ['6', '2', '3', '12'],
    answers: [0, 1, 2],
    explain: {
      rule: 'Наклон прямой',
      paragraphs: ['Наклон равен изменению y, делённому на изменение x: (10 − 4) / (2 − 0).', 'Получаем 6 / 2 = 3.'],
      examples: ['slope = (y2 − y1) / (x2 − x1)'],
    },
  },
  {
    kind: 'fill',
    title: 'Заполни пропуски',
    parts: ['x² = 49 и x > 0', '\n', 'x =', null],
    options: ['−7', '7', '14', '24.5'],
    answers: [1],
    explain: {
      rule: 'Условие x > 0',
      paragraphs: ['Из x² = 49 получаем два корня: 7 и −7.', 'Условие x > 0 оставляет только положительный корень, то есть 7.'],
      examples: ['7 · 7 = 49', '(−7) · (−7) = 49, но −7 < 0'],
    },
  },
  {
    kind: 'fill',
    title: 'Заполни пропуски',
    parts: ['x + y = 10', '\n', 'x − y = 4', '\n', '2x =', null, '\n', 'x =', null],
    options: ['6', '14', '7', '3'],
    answers: [1, 2],
    explain: {
      rule: 'Сложение уравнений',
      paragraphs: ['Складываем оба уравнения: y сокращается, остаётся 2x = 14.', 'Значит, x = 7. Проверка: 7 + 3 = 10 и 7 − 3 = 4.'],
      examples: ['(x + y) + (x − y) = 10 + 4'],
    },
  },
];

export const GRAMMAR_QUESTIONS: Question[] = [
  {
    kind: 'fill',
    title: 'Закончите предложение',
    parts: ['Each of the students', null, 'responsible for the project.'],
    options: ['are', 'is', 'were', 'be'],
    answers: [1],
    explain: {
      rule: 'Each + единственное число',
      paragraphs: [
        'Слово each (каждый) всегда стоит в единственном числе, даже если дальше идёт слово во множественном числе, как students.',
        'Поэтому глагол тоже должен быть в единственном числе: is, а не are.',
      ],
      examples: ['Each of the players is ready.', 'Each student has a book.'],
    },
  },
  {
    kind: 'fill',
    title: 'Закончите предложение',
    parts: ['The committee', null, 'its decision yesterday.'],
    options: ['announces', 'announced', 'announcing', 'announce'],
    answers: [1],
    explain: {
      rule: 'yesterday + прошедшее время',
      paragraphs: [
        'Слово yesterday показывает, что действие уже закончилось. Значит, глагол нужен в прошедшем времени.',
        'Форма announced подходит, остальные варианты относятся к настоящему времени или не образуют полное сказуемое.',
      ],
      examples: ['She called me yesterday.', 'We finished the test yesterday.'],
    },
  },
  {
    kind: 'fill',
    title: 'Закончите предложение',
    parts: ['The study was small;', null, 'its results were promising.'],
    options: ['therefore', 'however', 'similarly', 'for example'],
    answers: [1],
    explain: {
      rule: 'Контраст требует however',
      paragraphs: [
        'Первая часть говорит, что исследование маленькое. Вторая часть говорит, что результаты хорошие. Эти мысли противоположные.',
        'Для противопоставления нужно связующее слово however (однако).',
      ],
      examples: ['The test was hard; however, she passed.'],
    },
  },
  {
    kind: 'fill',
    title: 'Закончите предложение',
    parts: ['She studied hard every day;', null, 'she passed the exam.'],
    options: ['however', 'therefore', 'instead', 'meanwhile'],
    answers: [1],
    explain: {
      rule: 'Причина и следствие',
      paragraphs: [
        'Вторая часть объясняет результат первой: училась, поэтому сдала.',
        'Для следствия нужно слово therefore (поэтому). However и instead показывают контраст, meanwhile говорит о времени.',
      ],
      examples: ['It rained, therefore we stayed home.'],
    },
  },
  {
    kind: 'fill',
    title: 'Закончите предложение',
    parts: ['Neither the teacher nor the students', null, 'ready for the test.'],
    options: ['was', 'were', 'is', 'be'],
    answers: [1],
    explain: {
      rule: 'Neither ... nor',
      paragraphs: [
        'В конструкции neither ... nor глагол согласуется с ближайшим подлежащим.',
        'Ближайшее здесь students, оно во множественном числе, поэтому нужен глагол were.',
      ],
      examples: ['Neither the students nor the teacher was late.'],
    },
  },
];

/** Какой набор заданий открывать для раздела. Позже здесь появится загрузка с бэка. */
export const LESSONS: Record<Section, Question[]> = {
  MATH: MATH_QUESTIONS,
  READING_WRITING: GRAMMAR_QUESTIONS,
};