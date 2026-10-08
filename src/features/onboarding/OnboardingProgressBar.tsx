import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../core/theme-context';
import { spacing, radius } from '../../core/design-tokens';

interface Props {
  current: number;
  total: number;
  onBack?: () => void;
}

export function OnboardingProgressBar({ current, total, onBack }: Props) {
  const { colors } = useTheme();
  const progress = total > 0 ? (current + 1) / total : 0;

  return (
    <View style={styles.row}>
      {onBack && (
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backButton}
        >
          <Text style={[styles.backIcon, { color: colors.muted }]}>←</Text>
        </Pressable>
      )}

      <View
        style={[styles.track, { backgroundColor: colors.line }]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: current + 1 }}
        accessibilityLabel={`Step ${current + 1} of ${total}`}
      >
        <View
          style={[
            styles.fill,
            { backgroundColor: colors.mint, width: `${Math.min(progress, 1) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  backButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    fontWeight: '800',
  },
  track: {
    flex: 1,
    height: 12,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.full },
});