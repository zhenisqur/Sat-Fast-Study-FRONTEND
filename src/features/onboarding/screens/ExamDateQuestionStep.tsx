import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../../core/language-context';
import { useTheme } from '../../../core/theme-context';
import { spacing, typeScale } from '../../../core/design-tokens';
import { ChunkyOptionButton } from './ChunkyOptionButton';
import { ExamDateSlider } from './ExamDateSlider';

interface Props {
  onConfirm: (examDate: string | null) => void;
}

function todayPlusDaysIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function ExamDateQuestionStep({ onConfirm }: Props) {
  const { locale } = useLanguage();
  const { colors } = useTheme();
  const isRu = locale === 'ru';

  const [selectedDate, setSelectedDate] = useState<string>(() => todayPlusDaysIso(120));

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={[styles.question, { color: colors.text }]}>
        {isRu ? 'Когда вы сдаёте SAT?' : 'When are you taking the SAT?'}
      </Text>

      <View style={styles.sliderWrap}>
        <ExamDateSlider onChange={setSelectedDate} />
      </View>

      <ChunkyOptionButton
        label={isRu ? 'Ещё не определился(-ась)' : "I haven't decided yet"}
        compact
        onPress={() => onConfirm(null)}
      />

      <View style={styles.cta}>
        <ChunkyOptionButton
          label={isRu ? 'Далее' : 'Next'}
          variant="primary"
          onPress={() => onConfirm(selectedDate)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
  question: {
    fontSize: typeScale.title,
    fontWeight: '800',
    lineHeight: typeScale.title * 1.3,
    marginBottom: spacing.xxl,
  },
  sliderWrap: { marginBottom: spacing.xl },
  cta: { marginTop: spacing.xl },
});