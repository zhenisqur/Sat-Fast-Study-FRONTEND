import React, { useEffect, useRef } from 'react';
import { Animated, Image, ImageSourcePropType, Pressable, StyleSheet, Text } from 'react-native';
import { ThemeColors } from '../../core/theme';
import { Section } from '../../core/types';

export const MASCOT_CALM = require('../../assets/mascot/lesson/lesson-calm.png');
export const MASCOT_HAPPY = require('../../assets/mascot/lesson/lesson-happy.png');
/** Рамка маскота в задании. Все маскоты стоят в ней на одной линии пола и имеют одинаковую высоту. */
export const MASCOT_BOX = { width: 150, height: 200 };

/** Стиль слоя маскота: высота у всех одна, ширина по пропорциям картинки, по центру рамки, ноги внизу. */
export function mascotLayerStyle(source: ImageSourcePropType) {
  const meta = Image.resolveAssetSource(source);
  const ratio = meta && meta.height ? meta.width / meta.height : 0.67;
  const height = Math.min(MASCOT_BOX.height, MASCOT_BOX.width / ratio);
  const width = height * ratio;
  return { position: 'absolute' as const, bottom: 0, left: (MASCOT_BOX.width - width) / 2, width, height };
}

// Маскот при неверном ответе: по математике красный, по грамматике плачущий.
export const MASCOT_WRONG: Record<Section, ImageSourcePropType> = {
  MATH: require('../../assets/mascot/lesson/loos.png'),
  READING_WRITING: require('../../assets/mascot/lesson/cry.png'),
};

export const GREEN = '#58CC02';
export const GREEN_SHADOW = '#46A302';
export const GREEN_PANEL = '#17301F';
export const RED = '#FF4B4B';
export const RED_SHADOW = '#C93A3A';
export const RED_PANEL = '#3A1A22';
export const BLUE = '#43B9F4';
export const BLUE_SHADOW = '#2C93C9';
export const BUTTON_TEXT = '#251D42';
// Фон всего урока: экран, плитки и варианты ответа.
export const BG = '#161324';

/** Стили, которые нужны сразу нескольким видам урока: экран, нижняя панель, плитки и текст предложения. */
export function makeSharedStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: BG },
    footer: { paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 2, borderTopColor: colors.line, gap: 6 },

    sentenceText: { color: colors.text, fontSize: 18, lineHeight: 26, fontWeight: '600' },
    lineBreak: { width: '100%', height: 0 },

    tile: { paddingVertical: 11, paddingHorizontal: 18, borderRadius: 14, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line, backgroundColor: BG },
    tileText: { color: colors.text, fontSize: 18, fontWeight: '700' },
    tilePressed: { opacity: 0.8 },
    tileRight: { borderColor: GREEN, backgroundColor: GREEN_PANEL },
    tileWrong: { borderColor: RED, backgroundColor: RED_PANEL },
  });
}

/** Крупная кнопка с нижней "толщиной", как в Duolingo. При нажатии вдавливается. */
export function ChunkyButton({
  label,
  color,
  shadow,
  textColor = BUTTON_TEXT,
  disabled,
  onPress,
}: {
  label: string;
  color: string;
  shadow: string;
  textColor?: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [buttonStyles.base, { backgroundColor: color, borderBottomColor: shadow }, pressed && buttonStyles.pressed]}
    >
      <Text style={[buttonStyles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const buttonStyles = StyleSheet.create({
  base: { height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 5 },
  pressed: { transform: [{ translateY: 3 }], borderBottomWidth: 2 },
  label: { fontSize: 16, fontWeight: '900', letterSpacing: 1 },
});

/** Плитка, которая при появлении слегка "выпрыгивает" с пружиной. */
export function Pop({ children }: { children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }).start();
  }, [scale]);
  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}