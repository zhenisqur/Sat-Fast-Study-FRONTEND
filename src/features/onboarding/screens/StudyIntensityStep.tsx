import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../../core/language-context';
import { useTheme } from '../../../core/theme-context';
import { spacing, typeScale } from '../../../core/design-tokens';
import { StudyIntensity } from '../types';
import { ChunkyOptionButton } from './ChunkyOptionButton';

interface Props {
  onConfirm: (intensity: StudyIntensity) => void;
}

const INTENSITY_OPTIONS: { key: StudyIntensity; labelRu: string; labelEn: string; subRu: string; subEn: string }[] = [
  { key: 'light', labelRu: 'Лёгкий', labelEn: 'Light', subRu: '5 мин/день', subEn: '5 min/day' },
  { key: 'regular', labelRu: 'Обычный', labelEn: 'Regular', subRu: '10 мин/день', subEn: '10 min/day' },
  { key: 'serious', labelRu: 'Серьёзный', labelEn: 'Serious', subRu: '15 мин/день', subEn: '15 min/day' },
  { key: 'intense', labelRu: 'Интенсивный', labelEn: 'Intense', subRu: '20 мин/день', subEn: '20 min/day' },
];

export function StudyIntensityStep({ onConfirm }: Props) {
  const { locale } = useLanguage();
  const { colors } = useTheme();
  const isRu = locale === 'ru';

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={[styles.question, { color: colors.text }]}>
        {isRu ? 'Насколько интенсивно хочешь заниматься?' : 'How intense should your prep be?'}
      </Text>

      <View style={styles.grid}>
        {INTENSITY_OPTIONS.map((option) => (
          <View key={option.key} style={styles.cell}>
            <ChunkyOptionButton
              label={isRu ? option.labelRu : option.labelEn}
              sublabel={isRu ? option.subRu : option.subEn}
              compact
              onPress={() => onConfirm(option.key)}
            />
          </View>
        ))}
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