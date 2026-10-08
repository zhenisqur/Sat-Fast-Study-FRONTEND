import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import { useTheme } from '../../../core/theme-context';
import { useLanguage } from '../../../core/language-context';
import { spacing, typeScale, radius } from '../../../core/design-tokens';

const THUMB_SIZE = 28;
const TOUCH_HEIGHT = 44; // зона нажатия выше самого кружка, чтобы удобнее хватать
const RANGE_DAYS = 365;
const INITIAL_PROGRESS = 0.33;

interface Props {
  onChange?: (isoDate: string) => void;
}

function formatDate(date: Date, isRu: boolean) {
  return date.toLocaleDateString(isRu ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function ExamDateSlider({ onChange }: Props) {
  const { colors } = useTheme();
  const { locale } = useLanguage();
  const isRu = locale === 'ru';

  const [trackWidth, setTrackWidth] = useState(0);
  const [progress, setProgress] = useState(INITIAL_PROGRESS);
  // Актуальное значение для жестов (state внутри PanResponder может отставать).
  const progressRef = useRef(INITIAL_PROGRESS);
  const startProgressRef = useRef(INITIAL_PROGRESS);

  // Кружок ездит по "рабочей" ширине: центр от THUMB/2 до trackWidth - THUMB/2.
  const usableWidth = Math.max(1, trackWidth - THUMB_SIZE);

  const updateProgress = (value: number) => {
    progressRef.current = value;
    setProgress(value);
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (evt) => {
          if (trackWidth <= 0) return;
          // Кружок с pointerEvents="none", поэтому locationX всегда считается от начала дорожки.
          const touchX = evt.nativeEvent.locationX;
          const thumbCenter = THUMB_SIZE / 2 + progressRef.current * usableWidth;

          // Нажали рядом с кружком — просто берём его, без прыжка.
          // Нажали далеко — переносим кружок под палец (тап по дорожке).
          if (Math.abs(touchX - thumbCenter) > THUMB_SIZE) {
            updateProgress(clamp01((touchX - THUMB_SIZE / 2) / usableWidth));
          }
          startProgressRef.current = progressRef.current;
        },
        onPanResponderMove: (_evt, gesture) => {
          if (trackWidth <= 0) return;
          updateProgress(clamp01(startProgressRef.current + gesture.dx / usableWidth));
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trackWidth, usableWidth]
  );

  const today = useMemo(() => new Date(), []);
  const daysLeft = Math.round(progress * RANGE_DAYS);
  const selectedDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysLeft);
    return d;
  }, [daysLeft, today]);

  useEffect(() => {
    onChange?.(selectedDate.toISOString().slice(0, 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const thumbLeft = progress * usableWidth;

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <Text style={[styles.dateLabel, { color: colors.text }]} numberOfLines={1}>
          {formatDate(selectedDate, isRu)}
        </Text>
        <Text style={[styles.daysLabel, { color: colors.mintDeep }]} numberOfLines={1}>
          {daysLeft} {isRu ? 'дней' : 'days'}
        </Text>
      </View>

      <View style={styles.trackWrap} onLayout={handleLayout} {...panResponder.panHandlers}>
        <View style={[styles.track, { backgroundColor: colors.line }]} pointerEvents="none">
          <View
            style={[
              styles.fill,
              { backgroundColor: colors.mint, width: thumbLeft + THUMB_SIZE / 2 },
            ]}
          />
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              backgroundColor: colors.mint,
              borderColor: colors.white,
              left: thumbLeft,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  dateLabel: { fontSize: typeScale.subhead, fontWeight: '800', flexShrink: 1 },
  daysLabel: { fontSize: typeScale.subhead, fontWeight: '800' },
  // Зона нажатия выше кружка, но отрицательные отступы возвращают прежнюю высоту блока в макете,
  // чтобы кнопки ниже не съезжали.
  trackWrap: {
    width: '100%',
    height: TOUCH_HEIGHT,
    justifyContent: 'center',
    marginVertical: -(TOUCH_HEIGHT - THUMB_SIZE) / 2,
  },
  track: { width: '100%', height: 8, borderRadius: radius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.full },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 3,
  },
});