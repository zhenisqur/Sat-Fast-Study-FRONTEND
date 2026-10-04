import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../../core/language-context';
import { useTheme } from '../../../core/theme-context';
import { spacing, typeScale } from '../../../core/design-tokens';
import { ChunkyOptionButton } from './ChunkyOptionButton';

interface Props {
  value: string | null;
  onConfirm: (date: string) => void;
}

const UPCOMING_SAT_DATES = [
  { iso: '2026-11-07', labelEn: 'November 7, 2026', labelRu: '7 ноября 2026' },
  { iso: '2026-12-05', labelEn: 'December 5, 2026', labelRu: '5 декабря 2026' },
  { iso: '2027-03-06', labelEn: 'March 6, 2027', labelRu: '6 марта 2027' },
  { iso: '2027-05-01', labelEn: 'May 1, 2027', labelRu: '1 мая 2027' },
  { iso: '2027-06-05', labelEn: 'June 5, 2027', labelRu: '5 июня 2027' },
];

export function ExamDateStep({ onConfirm }: Props) {
  const { locale } = useLanguage();
  const { colors } = useTheme();
  const isRu = locale === 'ru';

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={[styles.question, { color: colors.text }]}>
        {isRu ? 'Когда вы сдаёте SAT?' : 'When are you taking the SAT?'}
      </Text>

      <View style={styles.grid}>
        {UPCOMING_SAT_DATES.map((date) => (
          <View key={date.iso} style={styles.cell}>
            <ChunkyOptionButton
              label={isRu ? date.labelRu : date.labelEn}
              compact
              onPress={() => onConfirm(date.iso)}
            />
          </View>
        ))}
        <View style={styles.cell}>
          <ChunkyOptionButton
            label={isRu ? 'Ещё не определился(-ась)' : "I haven't decided yet"}
            compact
            onPress={() => onConfirm('UNDECIDED')}
          />
        </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cell: {
    width: '47%',
  },
});