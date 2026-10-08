import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Animated, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../core/theme-context';
import { spacing, typeScale, radius, motion } from '../../../core/design-tokens';

interface Props {
  label: string;
  sublabel?: string;
  /** Иконка слева от текста (флаг, логотип и т.п.). */
  icon?: React.ReactNode;
  variant?: 'default' | 'primary';
  compact?: boolean;
  onPress: () => void;
}

export function ChunkyOptionButton({ label, sublabel, icon, variant = 'default', compact = false, onPress }: Props) {
  const { colors } = useTheme();
  const pressAnim = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);
  const isPrimary = variant === 'primary';

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  const animateTo = (toValue: number) => {
    if (reduceMotion) return;
    Animated.timing(pressAnim, { toValue, duration: motion.fast, useNativeDriver: true }).start();
  };

  const translateY = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.shadow, { backgroundColor: isPrimary ? colors.mintDeep : colors.line }]} />
      <Animated.View style={{ transform: [{ translateY }] }}>
        <Pressable
          onPressIn={() => animateTo(1)}
          onPressOut={() => animateTo(0)}
          onPress={handlePress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={sublabel ? `${label}, ${sublabel}` : label}
          style={[
            styles.option,
            compact && styles.optionCompact,
            icon ? styles.optionWithIcon : null,
            {
              backgroundColor: isPrimary ? colors.mint : colors.white,
              borderColor: isPrimary ? colors.mintDeep : colors.line,
            },
          ]}
        >
          {icon ? (
            <View style={styles.row}>
              <View style={styles.iconWrap}>{icon}</View>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                style={[
                  styles.label,
                  styles.labelInRow,
                  { color: isPrimary ? colors.ink : colors.text },
                ]}
              >
                {label}
              </Text>
            </View>
          ) : (
            <Text
              // в сетке подписи держим в одну строку по центру, чтобы кнопки были одной высоты
              numberOfLines={compact ? 1 : undefined}
              adjustsFontSizeToFit={compact}
              minimumFontScale={0.75}
              style={[
                styles.label,
                compact && styles.labelCompact,
                compact && styles.labelCentered,
                { color: isPrimary ? colors.ink : colors.text },
              ]}
            >
              {label}
            </Text>
          )}
          {sublabel && <Text style={[styles.sublabel, { color: colors.muted }]}>{sublabel}</Text>}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  shadow: { position: 'absolute', top: 5, left: 0, right: 0, bottom: 0, borderRadius: radius.xl },
  option: {
    borderWidth: 2,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg + 2,
    paddingHorizontal: spacing.xl + 2,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCompact: {
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  // с иконкой чуть меньше боковые отступы, чтобы длинные подписи («Play Market») помещались
  optionWithIcon: {
    paddingHorizontal: spacing.md,
  },
  // иконка в колонке одинаковой ширины, текст выровнен слева: названия стоят ровно
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', alignSelf: 'stretch', gap: spacing.sm },
  iconWrap: { width: 32, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: typeScale.subhead - 1, fontWeight: '700' },
  labelInRow: { flex: 1, fontSize: typeScale.subhead - 3, textAlign: 'left' },
  labelCentered: { textAlign: 'center', alignSelf: 'stretch' },
  labelCompact: { fontSize: typeScale.subhead - 2 },
  sublabel: { fontSize: typeScale.footnote, fontWeight: '600', marginTop: 2 },
});