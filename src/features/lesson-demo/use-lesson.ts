import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { haptics } from '../../core/haptics';
import { LessonStatus, Question, answersOf, emptyPicks } from './lesson-data';

/** Вся логика прохождения урока: текущее задание, выборы по пропускам, проверка, переход дальше. Без интерфейса. */
export function useLessonSession(questions: Question[]) {
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(() => emptyPicks(questions[0]));
  const [status, setStatus] = useState<LessonStatus>('idle');
  const [showExplain, setShowExplain] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = questions.length;
  const question = questions[index];
  const answers = answersOf(question);
  const locked = status !== 'idle';
  const ok = status === 'correct';
  const allFilled = picks.every((pick) => pick !== null);
  const progress = finished ? 1 : (index + (locked ? 1 : 0)) / total;

  /** Тап по слову в банке: ставим в первый пустой пропуск (для choice просто выбираем вариант). */
  const choose = (optionIndex: number) => {
    if (locked) return;
    if (question.kind === 'choice') {
      haptics.select();
      setPicks([optionIndex]);
      return;
    }
    if (picks.includes(optionIndex)) return;
    const slot = picks.indexOf(null);
    if (slot < 0) return;
    haptics.select();
    const nextPicks = [...picks];
    nextPicks[slot] = optionIndex;
    setPicks(nextPicks);
  };

  /** Тап по уже поставленному слову: возвращаем его в банк. */
  /** Слово перетащили на конкретный пропуск. Если там уже стояло слово, оно возвращается в банк. */
  const placeAt = (optionIndex: number, slot: number) => {
    if (locked || question.kind !== 'fill') return;
    if (slot < 0 || slot >= picks.length) return;
    haptics.select();
    const nextPicks = picks.map((pick) => (pick === optionIndex ? null : pick));
    nextPicks[slot] = optionIndex;
    setPicks(nextPicks);
  };

  const clearSlot = (slot: number) => {
    if (locked) return;
    haptics.select();
    const nextPicks = [...picks];
    nextPicks[slot] = null;
    setPicks(nextPicks);
  };

  const check = () => {
    if (!allFilled) return;
    haptics.select();
    const correct = answers.every((answer, slot) => picks[slot] === answer);
    setStatus(correct ? 'correct' : 'wrong');
    if (correct) setCorrectCount((count) => count + 1);
  };

  const next = () => {
    haptics.select();
    if (index + 1 >= total) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setPicks(emptyPicks(questions[index + 1]));
    setStatus('idle');
    setShowExplain(false);
  };

  const restart = () => {
    setIndex(0);
    setPicks(emptyPicks(questions[0]));
    setStatus('idle');
    setShowExplain(false);
    setCorrectCount(0);
    setFinished(false);
  };

  const openExplain = () => {
    haptics.select();
    setShowExplain(true);
  };

  const closeExplain = () => setShowExplain(false);

  return {
    total, index, question, answers, picks, status, locked, ok, allFilled, progress,
    showExplain, correctCount, finished,
    choose, placeAt, clearSlot, check, next, restart, openExplain, closeExplain,
  };
}

export type LessonSession = ReturnType<typeof useLessonSession>;

/** Сколько длится подъём маскота в прыжке. */
const JUMP_UP_MS = 120;
/** Смена картинки идёт последними SWAP_MS подъёма и заканчивается ровно в верхней точке прыжка. */
const SWAP_MS = 40;

/** Все анимации урока в одном месте. Экраны только берут готовые значения и вешают их на стили. */
export function useLessonAnimations({
  index,
  status,
  finished,
  progress,
}: {
  index: number;
  status: LessonStatus;
  finished: boolean;
  progress: number;
}) {
  const enter = useRef(new Animated.Value(0)).current;
  const bankIn = useRef(new Animated.Value(0)).current;
  const jump = useRef(new Animated.Value(0)).current;
  const swap = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const panelIn = useRef(new Animated.Value(0)).current;
  const barAnim = useRef(new Animated.Value(0)).current;
  const finishIn = useRef(new Animated.Value(0)).current;

  // Новое задание: пузырь с маскотом выезжает снизу, чуть позже за ним банк слов.
  useEffect(() => {
    enter.setValue(0);
    bankIn.setValue(0);
    Animated.parallel([
      Animated.timing(enter, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(bankIn, { toValue: 1, duration: 420, delay: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [index, enter, bankIn]);

  // Маскот стоит на месте. После проверки он прыгает, а картинка плавно меняется на другую так,
  // чтобы смена закончилась в верхней точке прыжка. Оба движения идут на нативном драйвере и стартуют вместе.
  useEffect(() => {
    if (status === 'idle') {
      panelIn.setValue(0);
      swap.setValue(0);
      return;
    }
    Animated.spring(panelIn, { toValue: 1, friction: 8, tension: 70, useNativeDriver: true }).start();
    swap.setValue(0);
    Animated.sequence([
      Animated.timing(jump, { toValue: 1, duration: JUMP_UP_MS, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(jump, { toValue: 0, friction: 6, tension: 220, useNativeDriver: true }),
    ]).start();
    Animated.timing(swap, { toValue: 1, duration: SWAP_MS, delay: JUMP_UP_MS - SWAP_MS, useNativeDriver: true }).start();
    if (status === 'wrong') {
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 90, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 90, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [status, panelIn, jump, swap, shake]);

  // Полоса прогресса плавно догоняет.
  useEffect(() => {
    Animated.timing(barAnim, { toValue: progress, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [progress, barAnim]);

  // Итоговый экран: маскот выпрыгивает с пружиной.
  useEffect(() => {
    if (!finished) {
      finishIn.setValue(0);
      return;
    }
    Animated.spring(finishIn, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }).start();
  }, [finished, finishIn]);

  return {
    enter,
    bankIn,
    panelIn,
    finishIn,
    enterY: enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
    bankY: bankIn.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }),
    mascotY: jump.interpolate({ inputRange: [0, 1], outputRange: [0, -22] }),
    /** 0 -> 1: спокойный маскот гаснет, маскот-результат проявляется. */
    swap,
    calmOpacity: swap.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
    shakeX: shake.interpolate({ inputRange: [-1, 0, 1], outputRange: [-7, 0, 7] }),
    panelY: panelIn.interpolate({ inputRange: [0, 1], outputRange: [160, 0] }),
    barWidth: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['4%', '100%'] }),
    finishScale: finishIn.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
  };
}

export type LessonAnimations = ReturnType<typeof useLessonAnimations>;