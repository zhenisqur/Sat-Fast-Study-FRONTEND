import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../../core/language-context';
import { useTheme } from '../../../core/theme-context';
import { spacing, typeScale } from '../../../core/design-tokens';
import { SingleChoiceStepConfig } from '../types';
import { ChunkyOptionButton } from './ChunkyOptionButton';

interface Props {
  config: SingleChoiceStepConfig;
  onAnswer: (value: string) => void;
}

export function SingleChoiceStep({ config, onAnswer }: Props) {
  const { locale } = useLanguage();
  const { colors } = useTheme();
  const isRu = locale === 'ru';

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={[styles.question, { color: colors.text }]}>
        {isRu ? config.questionRu : config.questionEn}
      </Text>

      <View style={styles.grid}>
        {config.options.map((option) => (
          <View key={option.value} style={styles.cell}>
            <ChunkyOptionButton
              label={isRu ? option.labelRu : option.labelEn}
              compact
              onPress={() => onAnswer(option.value)}
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