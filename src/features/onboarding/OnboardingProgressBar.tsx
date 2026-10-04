import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../core/theme-context';
import { spacing, radius } from '../../core/design-tokens';

interface Props {
  current: number;
  total: number;
}

export function OnboardingProgressBar({ current, total }: Props) {
  const { colors } = useTheme();
  const progress = total > 0 ? (current + 1) / total : 0;

  return (
    <View
      style={[styles.track, { backgroundColor: colors.line }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: current + 1 }}
      accessibilityLabel={`Step ${current + 1} of ${total}`}
    >
      <View style={[styles.fill, { backgroundColor: colors.mint, width: `${Math.min(progress, 1) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 12,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginHorizontal: spacing.xxl,
    marginTop: spacing.md,
  },
  fill: { height: '100%', borderRadius: radius.full },
});