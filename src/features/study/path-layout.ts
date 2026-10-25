import { Image, ImageSourcePropType } from 'react-native';
import { StudyPath as StudyPathData, StudyPathNode } from '../../core/types';

// Геометрия и данные пути: константы раскладки, расчёт центров узлов, сегменты кольца и короткие названия тем.

export const PATH_AMPLITUDE = 90;
// Вертикальный шаг между узлами. Рядом с текущим узлом шаг больше, потому что вокруг него кольцо.
export const PATH_GAP = 116;
export const PATH_GAP_NEAR_CURRENT = 140;
// Центр первого узла от верха пути.
export const FIRST_NODE_Y = 64;
// На каком расстоянии от верха экрана оказывается текущий узел при открытии экрана.
export const SCROLL_TARGET_FROM_TOP = 300;

// ДЕМО: заглушки, чтобы оценить внешний вид. Серии и XP на сервере пока нет, звёзд мастерства тоже.
// Когда появятся данные, заменить эти значения и функцию demoStars реальными.
export const DEMO_STATS = { streak: 3, xp: 175 };
export const PATH_MAX_NODE = 100;
// Карточка под текущим узлом: боковые поля и сдвиг вниз от центра узла (ниже кольца).
export const CARD_SIDE_MARGIN = 32;
export const CARD_OFFSET_BELOW_CENTER = 84;
// Отступ над путём (под баннером): под него продлевается область, где нажатие закрывает карточку.
export const PATH_TOP_MARGIN = 24;

/** Размер узла и высота его бортика. Одинаковые у всех узлов: текущий, пройденный и закрытый. */
export const NODE_SIZE = 80;
export const NODE_DEPTH = 10;

/** Ширина дороги, которая петляет под узлами. */
export const ROAD_WIDTH = 70;

/** Дополнительная длина дороги между 2-м и 3-м узлом модуля: слева освобождается место под маскота. */
export const MODULE_MASCOT_GAP = 100;

/**
 * Маскот модуля: стоит слева от дороги между 1-м и 3-м узлом. Индекс в массиве = номер модуля (0 = первый).
 * Если для модуля маскота нет, место просто остаётся пустым.
 */
export const MODULE_MASCOTS: ImageSourcePropType[] = [require('../../assets/mascot/super/Sup.png')];
/** Цвет модуля: баннер с темой и текущий узел. Индекс = номер модуля, как у маскотов. Без цвета остаются стандартные. */
export type ModuleTheme = { color: string; shadow: string };
export const MODULE_THEMES: (ModuleTheme | undefined)[] = [{ color: '#327EB2', shadow: '#245C84' }];
export function moduleTheme(moduleIndex: number): ModuleTheme | undefined {
  return moduleIndex >= 0 ? MODULE_THEMES[moduleIndex] : undefined;
}

/** Рамка маскота: картинка вписывается в неё по пропорциям и стоит у нижнего края. */
export const MODULE_MASCOT_BOX = { width: 180, height: 220 };
/** Отступ маскота от левого края экрана и от центра 1-го узла модуля вниз. */
export const MODULE_MASCOT_SCREEN_LEFT = 6;
export const MODULE_MASCOT_BELOW_FIRST = 90;

/** Размер картинки маскота внутри рамки с сохранением пропорций. */
export function moduleMascotSize(source: ImageSourcePropType) {
  const meta = Image.resolveAssetSource(source);
  const ratio = meta && meta.height ? meta.width / meta.height : 1;
  const height = Math.min(MODULE_MASCOT_BOX.height, MODULE_MASCOT_BOX.width / ratio);
  return { width: height * ratio, height };
}

/** Положение узла внутри модуля по горизонтали: -1 слева, 1 справа. Длина равна размеру модуля. */
const MODULE_ZIGZAG = [-1, 1, -1];

/** Центры узлов: зигзаг по горизонтали, по вертикали рядом с текущим узлом шаг больше. */
export function layoutCenters(nodes: StudyPathNode[], centerX: number) {
  const centers: { x: number; y: number }[] = [];
  let y = FIRST_NODE_Y;
  nodes.forEach((node, index) => {
    if (index > 0) {
      const nearCurrent = node.status === 'current' || nodes[index - 1].status === 'current';
      y += nearCurrent ? PATH_GAP_NEAR_CURRENT : PATH_GAP;
      // Отрезок перед 3-м узлом модуля длиннее: там слева стоит маскот.
      if (index % MODULE_SIZE === 2) y += MODULE_MASCOT_GAP;
    }
    // В каждом модуле узлы стоят зигзагом: влево, вправо, влево.
    centers.push({ x: centerX + MODULE_ZIGZAG[index % MODULE_ZIGZAG.length] * PATH_AMPLITUDE, y });
  });
  return centers;
}

const TRAILING_STOP_WORDS = new Set(['in', 'of', 'and', 'the', 'a', 'an', 'to', 'for', 'with', 'on', 'at', 'by']);

/** Сжимает длинное название темы до пары слов: убирает скобки, берёт до 3 слов и не оставляет «хвост» вроде «in». */
export function shortTopic(name: string | null | undefined): string {
  if (!name) return '';
  const words = name.replace(/\s*\(.*?\)\s*/g, ' ').trim().split(/\s+/).filter(Boolean);
  let kept = words.slice(0, 3);
  while (kept.length > 1 && TRAILING_STOP_WORDS.has(kept[kept.length - 1].toLowerCase())) kept = kept.slice(0, -1);
  return kept.join(' ');
}

/** Название уровня для баннера и карточки: короткая Math-тема. */
export function topicTitle(node: StudyPathNode): string {
  return shortTopic(node.mathTopic) || `Уровень ${node.sequenceLevel}`;
}

/**
 * Сколько сегментов у кольца узла и сколько из них закрашено.
 * Пока сервер отдаёт прогресс только по вкладкам уровня (Math и, если есть, Grammar), сегмент = вкладка.
 * Когда появится прогресс по блокам внутри темы, достаточно вернуть здесь другие total и done.
 */
export function nodeSegments(node: StudyPathNode, data: StudyPathData): { total: number; done: number } {
  const total = node.hasGrammarTab ? 2 : 1;
  if (node.status === 'completed') return { total, done: total };
  if (node.status === 'current') {
    const done = (data.mathTabDone ? 1 : 0) + (node.hasGrammarTab && data.grammarTabDone ? 1 : 0);
    return { total, done };
  }
  return { total, done: 0 };
}

function polar(cx: number, cy: number, radius: number, degrees: number) {
  // degrees отсчитываются по часовой стрелке от верхней точки круга.
  const rad = (degrees * Math.PI) / 180;
  return { x: cx + radius * Math.sin(rad), y: cy - radius * Math.cos(rad) };
}

export function arcPath(cx: number, cy: number, radius: number, startDeg: number, endDeg: number) {
  const start = polar(cx, cy, radius, startDeg);
  const end = polar(cx, cy, radius, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y}`;
}

// ---------- Модули ----------

/** Сколько узлов в одном модуле. Следующий модуль скрыт за кнопкой РАЗБЛОКИРОВАТЬ, пока текущий не пройден целиком. */
export const MODULE_SIZE = 3;
/** Расстояние от центра последнего видимого узла до центра кнопки РАЗБЛОКИРОВАТЬ. */
export const UNLOCK_GAP = 150;
export const UNLOCK_WIDTH = 240;

function moduleNodes(nodes: StudyPathNode[], moduleIndex: number) {
  return nodes.slice(moduleIndex * MODULE_SIZE, (moduleIndex + 1) * MODULE_SIZE);
}

/** Модуль пройден, когда все его узлы пройдены. */
export function isModuleComplete(nodes: StudyPathNode[], moduleIndex: number) {
  const part = moduleNodes(nodes, moduleIndex);
  return part.length > 0 && part.every((node) => node.status === 'completed');
}

/**
 * Сколько модулей показать при открытии экрана: все модули, в которых уже есть хотя бы один пройденный узел (минимум один).
 * Модуль, который только что стал доступен и ещё не начат, остаётся за кнопкой, поэтому её надо нажать.
 * Ничего не хранится на телефоне: после перезапуска начатые модули сразу открыты.
 */
export function initialModules(nodes: StudyPathNode[]) {
  let shown = 1;
  for (let moduleIndex = 0; moduleIndex * MODULE_SIZE < nodes.length; moduleIndex++) {
    if (moduleNodes(nodes, moduleIndex).some((node) => node.status === 'completed')) shown = moduleIndex + 1;
  }
  return shown;
}