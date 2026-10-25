import React from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../core/theme-context';
import { ThemeColors } from '../../core/theme';
import { BLUE, BLUE_SHADOW, GREEN, MASCOT_HAPPY, ChunkyButton, makeSharedStyles } from './lesson-ui';
import { LessonAnimations, LessonSession } from './use-lesson';

/** Экран "Объяснение ошибки": задание с правильными ответами и карточка с правилом. */
export function ExplainView({ session, bottomPad }: { session: LessonSession; bottomPad: number }) {
  const { colors } = useTheme();
  const shared = makeSharedStyles(colors);
  const styles = makeExplainStyles(colors);
  const { question, picks, answers } = session;

  // Показываем первую ошибку: что поставил юзер и что было правильно.
  const firstWrong = answers.findIndex((answer, slot) => picks[slot] !== answer);
  const slotIndex = firstWrong < 0 ? 0 : firstWrong;
  const wrongPick = picks[slotIndex];
  const wrongText = wrongPick !== null && wrongPick !== undefined ? question.options[wrongPick] : '';
  const rightText = question.options[answers[slotIndex]];
  let solutionSlot = 0;

  return (
    <View style={shared.screen}>
      <View style={styles.head}>
        <Pressable onPress={session.closeExplain} hitSlop={12} style={styles.back}>
          <Ionicons name="arrow-back" size={26} color={colors.muted} />
        </Pressable>
        <Text style={styles.title}>Объяснение ошибки</Text>
        <View style={styles.back} />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.sentence}>
          {question.kind === 'fill' ? (
            question.parts.map((part, partIndex) => {
              if (part === '\n') return <View key={partIndex} style={shared.lineBreak} />;
              if (part === null) {
                const slot = solutionSlot++;
                return (
                  <View key={partIndex} style={[shared.tile, shared.tileRight]}>
                    <Text style={[shared.tileText, { color: GREEN }]}>{question.options[question.answers[slot]]}</Text>
                  </View>
                );
              }
              return <Text key={partIndex} style={shared.sentenceText}>{part}</Text>;
            })
          ) : (
            <Text style={shared.sentenceText}>{question.text}</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardWrong}>{wrongText}</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.muted} />
            <Text style={styles.cardRight}>{rightText}</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.rule}>{question.explain.rule}</Text>
            {question.explain.paragraphs.map((paragraph) => (
              <Text key={paragraph} style={styles.paragraph}>{paragraph}</Text>
            ))}
            {question.explain.examples.map((example) => (
              <Text key={example} style={styles.paragraph}>{`•  ${example}`}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={[shared.footer, { paddingBottom: bottomPad }]}>
        <ChunkyButton label="ПРОДОЛЖИТЬ УРОК" color={BLUE} shadow={BLUE_SHADOW} onPress={session.closeExplain} />
      </View>
    </View>
  );
}

function makeExplainStyles(colors: ThemeColors) {
  return StyleSheet.create({
    head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14 },
    back: { width: 32 },
    title: { color: colors.text, fontSize: 19, fontWeight: '900' },
    body: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 },
    sentence: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
    card: { marginTop: 24, borderRadius: 18, borderWidth: 2, borderColor: colors.line, overflow: 'hidden' },
    cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 16, backgroundColor: colors.ink },
    cardWrong: { color: colors.muted, fontSize: 19, fontWeight: '700', textDecorationLine: 'line-through' },
    cardRight: { color: colors.text, fontSize: 19, fontWeight: '900' },
    cardBody: { padding: 16, gap: 12 },
    rule: { color: BLUE, fontSize: 17, fontWeight: '900' },
    paragraph: { color: colors.text, fontSize: 17, lineHeight: 25, fontWeight: '600' },
  });
}

/** Итог урока: радостный маскот, счёт и кнопки "закрыть" и "ещё раз". */
export function FinishView({
  session,
  anim,
  bottomPad,
  onClose,
}: {
  session: LessonSession;
  anim: LessonAnimations;
  bottomPad: number;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const shared = makeSharedStyles(colors);
  const styles = makeFinishStyles(colors);
  const { correctCount, total } = session;

  return (
    <View style={shared.screen}>
      <View style={styles.finish}>
        <Animated.View style={{ alignItems: 'center', opacity: anim.finishIn, transform: [{ scale: anim.finishScale }] }}>
          <Image source={MASCOT_HAPPY} resizeMode="contain" style={styles.mascot} />
          <Text style={styles.kicker}>УРОК ПРОЙДЕН</Text>
          <Text style={styles.score}>{correctCount} из {total}</Text>
          <Text style={styles.copy}>{correctCount === total ? 'Без единой ошибки' : 'Ошибки разберём в следующий раз'}</Text>
        </Animated.View>
      </View>
      <View style={[shared.footer, { paddingBottom: bottomPad }]}>
        <ChunkyButton label="ЗАКРЫТЬ" color={colors.gold} shadow={colors.goldShadow} onPress={onClose} />
        <Pressable onPress={session.restart} style={styles.secondary}>
          <Text style={styles.secondaryText}>ПРОЙТИ ЕЩЁ РАЗ</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeFinishStyles(colors: ThemeColors) {
  return StyleSheet.create({
    finish: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    mascot: { width: 245, height: 328 },
    kicker: { marginTop: 20, color: colors.purple, fontSize: 15, fontWeight: '900', letterSpacing: 2 },
    score: { marginTop: 8, color: colors.text, fontSize: 44, fontWeight: '900' },
    copy: { marginTop: 8, color: colors.muted, fontSize: 17, fontWeight: '700', textAlign: 'center' },
    secondary: { height: 46, alignItems: 'center', justifyContent: 'center' },
    secondaryText: { color: colors.purple, fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  });
}