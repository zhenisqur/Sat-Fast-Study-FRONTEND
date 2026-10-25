import React, { useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../core/theme-context';
import { ThemeColors } from '../../core/theme';
import { Section } from '../../core/types';
import {
  BG, GREEN, GREEN_PANEL, GREEN_SHADOW, MASCOT_BOX, MASCOT_CALM, MASCOT_HAPPY, MASCOT_WRONG, RED, RED_PANEL, RED_SHADOW,
  ChunkyButton, Pop, makeSharedStyles, mascotLayerStyle,
} from './lesson-ui';
import { LessonAnimations, LessonSession } from './use-lesson';

/** Верхняя строка урока: крестик и полоса прогресса. */
export function LessonHeader({ anim, onClose }: { anim: LessonAnimations; onClose: () => void }) {
  const { colors } = useTheme();
  const styles = makeHeaderStyles(colors);
  return (
    <View style={styles.top}>
      <Pressable onPress={onClose} hitSlop={12}>
        <Ionicons name="close" size={32} color={colors.muted} />
      </Pressable>
      <View style={styles.progressRail}>
        <Animated.View style={[styles.progressFill, { width: anim.barWidth }]} />
      </View>
    </View>
  );
}

function makeHeaderStyles(colors: ThemeColors) {
  return StyleSheet.create({
    top: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 14 },
    progressRail: { flex: 1, height: 18, borderRadius: 9, backgroundColor: '#372F58', overflow: 'hidden' },
    progressFill: { height: 18, borderRadius: 9, backgroundColor: colors.gold },
  });
}

const CORRECT_TITLES = ['Верно', 'Отлично', 'Так держать', 'Точно'];

/** Панель результата, которая выезжает снизу после проверки. При ошибке показывает правильный ответ и ссылку на объяснение. */
export function FeedbackPanel({
  ok,
  index,
  correctText,
  anim,
  bottomPad,
  onExplain,
  onNext,
}: {
  ok: boolean;
  index: number;
  /** Правильные слова по пропускам, уже склеенные в строку. */
  correctText: string;
  anim: LessonAnimations;
  bottomPad: number;
  onExplain: () => void;
  onNext: () => void;
}) {
  return (
    <Animated.View
      style={[
        feedbackStyles.feedback,
        { backgroundColor: ok ? GREEN_PANEL : RED_PANEL, paddingBottom: bottomPad, opacity: anim.panelIn, transform: [{ translateY: anim.panelY }] },
      ]}
    >
      <View style={feedbackStyles.feedbackHead}>
        <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={30} color={ok ? GREEN : RED} />
        <Text style={[feedbackStyles.feedbackTitle, { color: ok ? GREEN : RED }]}>{ok ? CORRECT_TITLES[index % CORRECT_TITLES.length] : 'Неверно'}</Text>
      </View>
      {!ok ? (
        <>
          <Text style={feedbackStyles.feedbackAnswer}>Правильный ответ: {correctText}</Text>
          <Pressable onPress={onExplain} style={feedbackStyles.explainLink}>
            <Ionicons name="bulb-outline" size={18} color={RED} />
            <Text style={feedbackStyles.explainLinkText}>ОБЪЯСНЕНИЕ</Text>
          </Pressable>
        </>
      ) : null}
      <ChunkyButton label="ПРОДОЛЖИТЬ" color={ok ? GREEN : RED} shadow={ok ? GREEN_SHADOW : RED_SHADOW} onPress={onNext} />
    </Animated.View>
  );
}

const feedbackStyles = StyleSheet.create({
  feedback: { paddingHorizontal: 20, paddingTop: 18, gap: 10 },
  feedbackHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedbackTitle: { fontSize: 22, fontWeight: '900' },
  feedbackAnswer: { color: RED, fontSize: 16, fontWeight: '700' },
  explainLink: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  explainLinkText: { color: RED, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
});

/**
 * Плитка банка, которую можно взять пальцем и перетащить на любой пропуск.
 * Короткий тап без движения работает как раньше: слово встаёт в первый свободный пропуск.
 * Если отпустить мимо пропуска, плитка пружиной возвращается на место.
 */
function DragTile({
  label,
  disabled,
  onTap,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  label: string;
  disabled: boolean;
  onTap: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  /** Координаты пальца на экране. Возвращает true, если слово встало в пропуск. */
  onDrop: (pageX: number, pageY: number) => boolean;
}) {
  const { colors } = useTheme();
  const shared = makeSharedStyles(colors);
  const pan = useRef(new Animated.ValueXY()).current;
  const lift = useRef(new Animated.Value(0)).current;
  const [dragging, setDragging] = useState(false);

  // PanResponder создаётся один раз, поэтому свежие пропсы читаем через ref.
  const props = useRef({ disabled, onTap, onDragStart, onDragEnd, onDrop });
  props.current = { disabled, onTap, onDragStart, onDragEnd, onDrop };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !props.current.disabled,
      onMoveShouldSetPanResponder: () => !props.current.disabled,
      // Пока тащим, не отдаём жест прокрутке.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        props.current.onDragStart();
        setDragging(true);
        Animated.spring(lift, { toValue: 1, friction: 6, tension: 220, useNativeDriver: false }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (event, gesture) => {
        const moved = Math.abs(gesture.dx) + Math.abs(gesture.dy) > 8;
        if (!moved) {
          props.current.onTap();
          settle(true);
          return;
        }
        settle(props.current.onDrop(event.nativeEvent.pageX, event.nativeEvent.pageY));
      },
      onPanResponderTerminate: () => settle(false),
    }),
  ).current;

  function settle(placed: boolean) {
    props.current.onDragEnd();
    lift.setValue(0);
    if (placed) {
      pan.setValue({ x: 0, y: 0 });
      setDragging(false);
      return;
    }
    Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 7, tension: 140, useNativeDriver: false }).start(() => setDragging(false));
  }

  const scale = lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        shared.tile,
        dragging && { borderColor: colors.purple, zIndex: 10, elevation: 10 },
        { transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }] },
      ]}
    >
      <Text style={shared.tileText}>{label}</Text>
    </Animated.View>
  );
}

/** Само задание: маскот с пузырём, банк слов (или варианты A-D), кнопка проверки и панель результата. */
export function TaskView({
  section,
  session,
  anim,
  bottomPad,
  onClose,
}: {
  section: Section;
  session: LessonSession;
  anim: LessonAnimations;
  bottomPad: number;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const shared = makeSharedStyles(colors);
  const styles = makeStyles(colors);
  const { question, picks, status, locked, ok, allFilled, answers, index } = session;
  let playSlot = 0;

  // Перетаскивание: где на экране стоят пропуски и идёт ли сейчас перетаскивание (тогда прокрутка выключена).
  const slotRefs = useRef<(View | null)[]>([]);
  const slotRects = useRef<{ x: number; y: number; w: number; h: number }[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const measureSlots = () => {
    slotRects.current = [];
    slotRefs.current.slice(0, picks.length).forEach((view, slot) => {
      view?.measure((_x, _y, w, h, pageX, pageY) => {
        slotRects.current[slot] = { x: pageX, y: pageY, w, h };
      });
    });
  };

  /** Ищем пропуск под пальцем (с запасом вокруг). Если попали в несколько, берём ближайший по центру. */
  const dropAt = (optionIndex: number, pageX: number, pageY: number) => {
    const PAD = 20;
    let best = -1;
    let bestDist = Infinity;
    slotRects.current.forEach((rect, slot) => {
      if (!rect || slot >= picks.length) return;
      const inside = pageX >= rect.x - PAD && pageX <= rect.x + rect.w + PAD && pageY >= rect.y - PAD && pageY <= rect.y + rect.h + PAD;
      if (!inside) return;
      const dist = Math.hypot(pageX - (rect.x + rect.w / 2), pageY - (rect.y + rect.h / 2));
      if (dist < bestDist) {
        bestDist = dist;
        best = slot;
      }
    });
    if (best < 0) return false;
    session.placeAt(optionIndex, best);
    return true;
  };

  return (
    <View style={shared.screen}>
      <LessonHeader anim={anim} onClose={onClose} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} scrollEnabled={!dragActive}>
        <Text style={styles.prompt}>{question.title}</Text>

        <Animated.View style={[styles.talk, { opacity: anim.enter, transform: [{ translateY: anim.enterY }] }]}>
          {/* Три маскота лежат стопкой и уже загружены, поэтому смена идёт без задержки. */}
          <Animated.View style={[styles.mascot, { transform: [{ translateY: anim.mascotY }] }]}>
            <Animated.Image source={MASCOT_CALM} resizeMode="contain" style={[mascotLayerStyle(MASCOT_CALM), { opacity: status === 'idle' ? 1 : anim.calmOpacity }]} />
            <Animated.Image source={MASCOT_HAPPY} resizeMode="contain" style={[mascotLayerStyle(MASCOT_HAPPY), { opacity: ok ? anim.swap : 0 }]} />
            <Animated.Image source={MASCOT_WRONG[section]} resizeMode="contain" style={[mascotLayerStyle(MASCOT_WRONG[section]), { opacity: status === 'wrong' ? anim.swap : 0 }]} />
          </Animated.View>
          <Animated.View style={[styles.bubbleWrap, { transform: [{ translateX: anim.shakeX }] }]}>
            <View style={styles.bubble}>
              {question.kind === 'fill' ? (
                question.parts.map((part, partIndex) => {
                  if (part === '\n') return <View key={partIndex} style={shared.lineBreak} />;
                  if (part === null) {
                    const slot = playSlot++;
                    const pick = picks[slot];
                    const setRef = (view: View | null) => {
                      slotRefs.current[slot] = view;
                    };
                    if (pick === null) return <View key={partIndex} ref={setRef} collapsable={false} style={styles.slotEmpty} />;
                    const slotRight = status !== 'idle' && pick === answers[slot];
                    const slotWrong = status !== 'idle' && pick !== answers[slot];
                    return (
                      <View key={partIndex} ref={setRef} collapsable={false}>
                        <Pop key={`${partIndex}-${pick}`}>
                          <Pressable
                            disabled={locked}
                            onPress={() => session.clearSlot(slot)}
                            style={[shared.tile, styles.tileSelected, slotRight && shared.tileRight, slotWrong && shared.tileWrong]}
                          >
                            <Text style={[shared.tileText, slotRight && { color: GREEN }, slotWrong && { color: RED }]}>{question.options[pick]}</Text>
                          </Pressable>
                        </Pop>
                      </View>
                    );
                  }
                  return <Text key={partIndex} style={shared.sentenceText}>{part}</Text>;
                })
              ) : (
                <Text style={shared.sentenceText}>{question.text}</Text>
              )}
            </View>
            <View style={styles.tail} />
          </Animated.View>
        </Animated.View>

        {question.kind === 'fill' ? (
          <Animated.View style={[styles.bank, { opacity: anim.bankIn, transform: [{ translateY: anim.bankY }] }]}>
            {question.options.map((option, optionIndex) =>
              picks.includes(optionIndex) ? (
                <View key={option} style={[shared.tile, styles.tilePlaceholder]}>
                  <Text style={[shared.tileText, { opacity: 0 }]}>{option}</Text>
                </View>
              ) : (
                <DragTile
                  key={option}
                  label={option}
                  disabled={locked}
                  onTap={() => session.choose(optionIndex)}
                  onDragStart={() => {
                    setDragActive(true);
                    measureSlots();
                  }}
                  onDragEnd={() => setDragActive(false)}
                  onDrop={(pageX, pageY) => dropAt(optionIndex, pageX, pageY)}
                />
              ),
            )}
          </Animated.View>
        ) : (
          <View style={styles.options}>
            {question.options.map((option, optionIndex) => {
              const isPicked = picks[0] === optionIndex;
              const isAnswer = optionIndex === question.answer;
              const showRight = locked && isAnswer;
              const showWrong = locked && isPicked && !isAnswer;
              return (
                <Pressable
                  key={option}
                  disabled={locked}
                  onPress={() => session.choose(optionIndex)}
                  style={({ pressed }) => [
                    styles.option,
                    isPicked && !locked && styles.optionSelected,
                    showRight && shared.tileRight,
                    showWrong && shared.tileWrong,
                    pressed && shared.tilePressed,
                  ]}
                >
                  <View style={[styles.optionKey, isPicked && !locked && styles.optionKeySelected, showRight && { borderColor: GREEN }, showWrong && { borderColor: RED }]}>
                    <Text style={[styles.optionKeyText, showRight && { color: GREEN }, showWrong && { color: RED }]}>{String.fromCharCode(65 + optionIndex)}</Text>
                  </View>
                  <Text style={[styles.optionText, showRight && { color: GREEN }, showWrong && { color: RED }]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {status === 'idle' ? (
        <View style={[shared.footer, { paddingBottom: bottomPad }]}>
          <ChunkyButton
            label="ПРОВЕРИТЬ"
            color={allFilled ? colors.gold : '#372F58'}
            shadow={allFilled ? colors.goldShadow : '#2A2345'}
            textColor={allFilled ? undefined : colors.muted}
            disabled={!allFilled}
            onPress={session.check}
          />
        </View>
      ) : (
        <FeedbackPanel
          ok={ok}
          index={index}
          correctText={answers.map((answer) => question.options[answer]).join(',  ')}
          anim={anim}
          bottomPad={bottomPad}
          onExplain={session.openExplain}
          onNext={session.next}
        />
      )}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 },
    prompt: { color: colors.text, fontSize: 26, fontWeight: '900' },

    talk: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 28, paddingBottom: 22, borderBottomWidth: 2, borderBottomColor: colors.line },
    mascot: { width: MASCOT_BOX.width, height: MASCOT_BOX.height },
    bubbleWrap: { flex: 1 },
    bubble: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, padding: 14, borderRadius: 18, borderWidth: 2, borderColor: colors.line },
    // Хвостик речевого пузыря: повёрнутый квадрат, который закрывает рамку пузыря и смотрит на маскота.
    tail: { position: 'absolute', left: -9, bottom: 34, width: 16, height: 16, backgroundColor: BG, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: colors.line, transform: [{ rotate: '45deg' }] },
    slotEmpty: { width: 64, height: 44, borderRadius: 14, backgroundColor: '#241E44' },

    bank: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 40 },
    tilePlaceholder: { backgroundColor: '#241E44', borderColor: '#241E44' },
    tileSelected: { borderColor: colors.purple },

    options: { marginTop: 24, gap: 12 },
    option: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line, backgroundColor: BG },
    optionSelected: { borderColor: colors.purple, backgroundColor: colors.lavender },
    optionKey: { width: 32, height: 32, borderRadius: 10, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
    optionKeySelected: { borderColor: colors.purple },
    optionKeyText: { color: colors.muted, fontSize: 15, fontWeight: '900' },
    optionText: { flex: 1, color: colors.text, fontSize: 18, fontWeight: '700' },
  });
}