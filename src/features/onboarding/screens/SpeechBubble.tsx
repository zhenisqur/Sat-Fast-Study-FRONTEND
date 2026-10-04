import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../core/theme-context';
import { spacing, radius } from '../../../core/design-tokens';

interface Props {
  children: React.ReactNode;
}

export function SpeechBubble({ children }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.bubble, { backgroundColor: colors.white, borderColor: colors.line }]}>
        {children}
      </View>
      <View style={[styles.tail, { borderTopColor: colors.white }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: '100%' },
  bubble: {
    borderWidth: 2,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});