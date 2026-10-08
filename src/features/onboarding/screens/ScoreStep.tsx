import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Keyboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../../../core/language-context';
import { useTheme } from '../../../core/theme-context';
import { spacing, typeScale, radius } from '../../../core/design-tokens';
import { ScoreMode } from '../types';

interface Props {
  /** 'previous' — «Твой последний результат», 'target' — «Желаемый результат». */
  mode: ScoreMode;
  /** Для режима 'target': желаемая сумма должна быть строго больше этого значения (прошлый результат). */
  minTotal?: number | null;
  onConfirm: (math: number, reading: number) => void;
}

const MIN_SECTION = 200;
const MAX_SECTION = 800;

const isValidSection = (value: string) => {
  if (value.length === 0) return false;
  const n = Number(value);
  return Number.isInteger(n) && n >= MIN_SECTION && n <= MAX_SECTION && n % 10 === 0;
};

export function ScoreStep({ mode, minTotal = null, onConfirm }: Props) {
  const { locale } = useLanguage();
  const { colors } = useTheme();
  const isRu = locale === 'ru';
  const isPrevious = mode === 'previous';

  const [math, setMath] = useState('');
  const [reading, setReading] = useState('');

  const sectionsValid = isValidSection(math) && isValidSection(reading);
  const sum = sectionsValid ? Number(math) + Number(reading) : null;
  // Цель должна быть выше прошлого результата.
  const tooLow = !isPrevious && sum != null && minTotal != null && sum <= minTotal;
  const isValid = sectionsValid && !tooLow;
  const total = isValid ? sum : null;

  const title = isPrevious
    ? isRu ? 'Твой последний результат' : 'Your last score'
    : isRu ? 'Какой балл хочешь набрать?' : 'What score do you want?';
  const hint = isRu ? 'По каждой части: от 200 до 800, кратно 10' : 'For each section: 200 to 800, in steps of 10';

  const mathLabel = isRu ? 'Математика' : 'Math';
  const readingLabel = isRu ? 'Грамматика' : 'Reading & Writing';

  const handleSubmit = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onConfirm(Number(math), Number(reading));
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.white, borderColor: colors.line, color: colors.text },
  ];

  return (
    <Pressable style={styles.container} onPress={Keyboard.dismiss} accessible={false}>
      <Text accessibilityRole="header" style={[styles.question, { color: colors.text }]}>
        {title}
      </Text>
      <Text
        style={[
          styles.hint,
          total != null || tooLow ? styles.hintTotal : null,
          { color: tooLow ? '#C53D51' : total != null ? colors.mintDeep : colors.muted },
        ]}
      >
        {tooLow
          ? isRu
            ? `Цель должна быть выше прошлого результата (${minTotal})`
            : `Goal must be higher than your last score (${minTotal})`
          : total != null
            ? `${isRu ? 'Итого: ' : 'Total: '}${total}`
            : hint}
      </Text>

      <View style={styles.formRow}>
        <View style={styles.inputsColumn}>
          <View>
            <Text style={[styles.label, { color: colors.text }]}>{mathLabel}</Text>
            <TextInput
              value={math}
              onChangeText={(v) => setMath(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={3}
              placeholder={isPrevious ? '520' : '700'}
              placeholderTextColor={colors.muted}
              accessibilityLabel={mathLabel}
              style={inputStyle}
            />
          </View>

          <View>
            <Text style={[styles.label, { color: colors.text }]}>{readingLabel}</Text>
            <TextInput
              value={reading}
              onChangeText={(v) => setReading(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={3}
              placeholder={isPrevious ? '530' : '700'}
              placeholderTextColor={colors.muted}
              accessibilityLabel={readingLabel}
              style={inputStyle}
            />
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={!isValid}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isValid }}
          accessibilityLabel={isRu ? 'Отправить' : 'Submit'}
          style={[
            styles.sendButton,
            {
              backgroundColor: isValid ? colors.mint : colors.line,
              borderColor: isValid ? colors.mintDeep : colors.line,
            },
          ]}
        >
          <Text style={[styles.sendIcon, { color: isValid ? colors.ink : colors.muted }]}>→</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
  question: {
    fontSize: typeScale.title,
    fontWeight: '800',
    lineHeight: typeScale.title * 1.3,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: typeScale.footnote,
    fontWeight: '500',
    marginBottom: spacing.xxl,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  inputsColumn: {
    flex: 1,
    gap: spacing.lg,
  },
  label: { fontSize: typeScale.subhead, fontWeight: '700', marginBottom: spacing.sm },
  input: {
    borderWidth: 2,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typeScale.subhead,
    fontWeight: '700',
    minHeight: 48,
  },
  hintTotal: { fontWeight: '800' },
  sendButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { fontSize: 24, fontWeight: '800' },
});