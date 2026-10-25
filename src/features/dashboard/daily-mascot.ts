import { ImageSourcePropType } from 'react-native';

/**
 * Маскот дня для шапки главной. Каждый день недели свой маскот, а шапка красится в цвет его фона,
 * поэтому границы картинки не видно.
 */
export type DailyMascot = {
  image: ImageSourcePropType;
  /** Цвет фона картинки. Им красится вся шапка. */
  background: string;
  /** Короткая фраза маскота в шапке вместо заголовка: 1-3 слова, чтобы не ломать вёрстку. */
  title: string;
  /** Если кадр у картинки другой (маскот мельче или крупнее), подгоняем масштаб. По умолчанию 1. */
  scale?: number;
  /** Сдвиг картинки вниз в пикселях, если маскот задевает плашки слева. По умолчанию 0. */
  offsetY?: number;
};

const MASCOTS = {
  agress: { image: require('../../assets/mascot/daily/agress.png'), background: '#B8BBFE', title: 'Ты где?' },
  brolook: { image: require('../../assets/mascot/daily/brolook.png'), background: '#FDDBD1', title: 'Bro fu*k,go study' },
  goldlook: { image: require('../../assets/mascot/daily/goldlook.png'), background: '#8ACD01', title: 'Время золото bro' },
  lovescore: { image: require('../../assets/mascot/daily/lovescore.png'), background: '#FFFFFF', title: 'BRO будь упорным' },
  time: { image: require('../../assets/mascot/daily/time.png'), background: '#FEC401', title: 'Время идет bro' },
  strict: { image: require('../../assets/mascot/daily/strict.png'), background: '#FE6D40', title: 'BRO без отмазок' },
  // Кадр у этой картинки мельче остальных, поэтому увеличиваем. Подгоняется на глаз: больше число, крупнее маскот.
  strongscore: { image: require('../../assets/mascot/daily/strongscore.png'), background: '#9E9E9E', title: 'Стань умнее', scale: 1.35, offsetY: 44 },
} satisfies Record<string, DailyMascot>;

// Порядок: понедельник ... воскресенье.
const WEEK: DailyMascot[] = [
  MASCOTS.agress, // пн
  MASCOTS.strongscore, // вт
  MASCOTS.brolook, // ср
  MASCOTS.goldlook, // чт
  MASCOTS.lovescore, // пт
  MASCOTS.time, // сб
  MASCOTS.strict, // вс
];

// ДЛЯ ПРОВЕРКИ: чтобы посмотреть маскота другого дня, поставь число 0-6 (0 пн, 1 вт, 2 ср, 3 чт, 4 пт, 5 сб, 6 вс).
// В обычной работе должно быть null.
const PREVIEW_DAY: number | null = 5;

/** Маскот на сегодня по времени телефона. Неделя начинается с понедельника. */
export function getDailyMascot(date: Date = new Date()): DailyMascot {
  return WEEK[PREVIEW_DAY ?? (date.getDay() + 6) % 7];
}

// ---------- Цвета текста поверх шапки ----------

const INK = '#251D42';
const WHITE = '#FFFFFF';
const ACCENT = '#6062EB';

function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((start) => {
    const channel = parseInt(value.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first: string, second: string): number {
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Какого цвета делать текст, надпись «Привет» и иконки системной строки, чтобы они читались на этом фоне. */
export function bannerPalette(background: string): { text: string; accent: string; statusBar: 'dark' | 'light' } {
  const text = contrast(background, INK) >= contrast(background, WHITE) ? INK : WHITE;
  // Надпись «Привет» всегда фиолетовая, как голова маскота, на любом фоне.
  return { text, accent: ACCENT, statusBar: text === INK ? 'dark' : 'light' };
}