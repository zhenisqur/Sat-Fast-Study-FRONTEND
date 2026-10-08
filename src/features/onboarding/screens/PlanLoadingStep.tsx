import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import { useLanguage } from '../../../core/language-context';
import { useTheme } from '../../../core/theme-context';
import { spacing, typeScale } from '../../../core/design-tokens';
import { MASCOT_HEIGHT } from './mascotLayout';

interface Props {
  onContinue: () => void;
}

const DURATION_MS = 3000;

// --- круглый индикатор: кольцо из точек, которые зажигаются по часовой стрелке ---
const RING_SIZE = 190;
const DOT_COUNT = 28;
const DOT_SIZE = 12;
const RING_RADIUS = RING_SIZE / 2 - DOT_SIZE / 2;

const MASCOT_SOURCE = require('../../../assets/mascot/thinktoplan.png');
const mascotAsset = Image.resolveAssetSource(MASCOT_SOURCE);
// Высота — единый норматив маскотов (MASCOT_HEIGHT), ширина — по пропорциям картинки.
const MASCOT_WIDTH = MASCOT_HEIGHT * (mascotAsset.width / mascotAsset.height);

export function PlanLoadingStep({ onContinue }: Props) {
  const { locale } = useLanguage();
  const { colors } = useTheme();
  const isRu = locale === 'ru';
  const progress = useRef(new Animated.Value(0)).current;
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const id = progress.addListener(({ value }) => setPercent(Math.round(value * 100)));
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();

    const timer = setTimeout(onContinue, DURATION_MS + 200);
    return () => {
      progress.removeListener(id);
      animation.stop();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dots = Array.from({ length: DOT_COUNT }, (_, i) => {
    const angle = (-90 + (i * 360) / DOT_COUNT) * (Math.PI / 180);
    const left = RING_SIZE / 2 + RING_RADIUS * Math.cos(angle) - DOT_SIZE / 2;
    const top = RING_SIZE / 2 + RING_RADIUS * Math.sin(angle) - DOT_SIZE / 2;
    const backgroundColor = progress.interpolate({
      inputRange: [i / DOT_COUNT, (i + 1) / DOT_COUNT],
      outputRange: [colors.line, colors.mint],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View
        key={i}
        style={[styles.dot, { left, top, backgroundColor }]}
      />
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />

      <View style={styles.ring}>
        {dots}
        <Text style={[styles.percent, { color: colors.text }]}>{percent}%</Text>
      </View>

      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
        {isRu ? 'Готовим твой план...' : 'Preparing your plan...'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        {isRu ? 'Учитываем твои ответы и подбираем темп' : 'Factoring in your answers and pacing it right'}
      </Text>

      <View style={styles.spacer} />

      {/* маскот прижат к самому низу экрана, пояс начинается от нижнего края */}
      <View style={styles.mascotBox}>
        <Image
          source={MASCOT_SOURCE}
          style={styles.mascot}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Mascot"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', overflow: 'hidden' },
  spacer: { flex: 1 },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  percent: { fontSize: typeScale.title + 10, fontWeight: '900' },
  title: {
    fontSize: typeScale.title,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xxl,
  },
  subtitle: {
    fontSize: typeScale.body,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
  mascotBox: {
    width: '100%',
    height: MASCOT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  mascot: { width: MASCOT_WIDTH, height: MASCOT_HEIGHT },
});