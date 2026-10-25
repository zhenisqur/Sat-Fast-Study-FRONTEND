import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../core/theme-context';
import { ThemeColors } from '../../core/theme';
import { haptics } from '../../core/haptics';
import { StudyPathNode } from '../../core/types';
import { ModuleTheme, NODE_DEPTH, NODE_SIZE, ROAD_WIDTH, arcPath } from './path-layout';
import { makeStyles } from './study-styles';

// Детали экрана пути: узел-шайба, счётчик в шапке, иконки, кольцо прогресса и плавное появление карточки.

export function LevelNode({
  colors,
  node,
  segments,
  open,
  accent,
  onPress,
}: {
  colors: ThemeColors;
  node: StudyPathNode;
  segments: { total: number; done: number };
  open: boolean;
  /** Цвет модуля для текущего узла. Если не задан, узел жёлтый, как раньше. */
  accent?: ModuleTheme;
  onPress: () => void;
}) {
  const styles = makeStyles(colors);
  const { scheme } = useTheme();
  const pressDepth = useRef(new Animated.Value(0)).current;
  const current = node.status === 'current';
  const complete = node.status === 'completed';
  const locked = node.status === 'locked';

  const size = NODE_SIZE;
  const depth = NODE_DEPTH;
  const topColor = complete ? colors.purple : current ? accent?.color ?? colors.gold : colors.line;
  // Закрытый узел тихий: бортик темнее лица, а не светлее, чтобы взгляд шёл к текущему узлу.
  const lockedRim = scheme === 'dark' ? colors.white : colors.muted;
  const bottomColor = complete ? colors.purpleDeep : current ? accent?.shadow ?? colors.goldShadow : lockedRim;

  // Пустые дуги кольца и пустые звёзды должны читаться на тёмном фоне (контраст около 3:1).
  const emptyColor = scheme === 'dark' ? '#6B6390' : colors.muted;

  const handlePressIn = () => {
    haptics.tap();
    Animated.timing(pressDepth, { toValue: depth, duration: 70, useNativeDriver: true }).start();
  };
  const release = () => {
    Animated.spring(pressDepth, { toValue: 0, useNativeDriver: true, friction: 4, tension: 160 }).start();
  };
  const handlePressOut = release;
  // Узел обязан вернуться вверх и по самому нажатию, даже если событие «отпустили» не дошло (карточка открылась на этом же касании).
  const handlePress = () => {
    release();
    onPress();
  };
  // При открытии и закрытии карточки узел тоже принудительно поднимается.
  useEffect(() => {
    Animated.spring(pressDepth, { toValue: 0, useNativeDriver: true, friction: 4, tension: 160 }).start();
  }, [open, pressDepth]);

  return (
    <View>
      {current ? <SegmentRing size={size} depth={depth} total={segments.total} done={segments.done} doneColor={accent?.color ?? colors.gold} emptyColor={emptyColor} /> : null}
      <Pressable disabled={locked} onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ width: size, height: size + depth }}>
        <View style={[styles.puckShadow, { width: size, height: size, borderRadius: size / 2, top: depth, backgroundColor: bottomColor }]} />
        <Animated.View style={[styles.puckFace, { width: size, height: size, borderRadius: size / 2, backgroundColor: topColor, transform: [{ translateY: pressDepth }] }]}>
          {locked ? (
            <LockIcon size={size * 0.34} color={scheme === 'dark' ? colors.muted : '#FFFFFF'} />
          ) : (
            complete ? <CheckIcon size={size * 0.5} color="#FFFFFF" /> : <Ionicons name="star" size={size * 0.46} color={accent ? '#FFFFFF' : colors.ink} />
          )}
          {!locked ? <View style={[styles.gloss, { top: size * 0.1, left: size * 0.2, width: size * 0.42, height: size * 0.11, borderRadius: size * 0.06 }]} /> : null}
        </Animated.View>
      </Pressable>
    </View>
  );
}

export function StatPill({ colors, icon, color, value }: { colors: ThemeColors; icon: React.ComponentProps<typeof Ionicons>['name']; color: string; value: string }) {
  const styles = makeStyles(colors);
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

/** Жирная галочка на пройденном узле (иконка Ionicons слишком тонкая). */
function CheckIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4.5 12.5 L10 18 L19.5 6.5" stroke={color} strokeWidth={4.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

// ---------- Сегментное кольцо вокруг узла: сколько частей уровня уже пройдено ----------

const RING_STROKE = 10;
// Зазор между узлом (вместе с «бортиком» снизу) и серединой кольца.
const RING_CLEARANCE = 16;

/** Плавное появление: карточка выезжает чуть сверху, увеличивается и проявляется. */
export function PopIn({
  style,
  visible = true,
  onHidden,
  children,
}: {
  style: StyleProp<ViewStyle>;
  /** false: карточка уезжает вверх, уменьшается и гаснет, потом вызывается onHidden, чтобы её убрать. */
  visible?: boolean;
  onHidden?: () => void;
  children: React.ReactNode;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const hidden = useRef(onHidden);
  hidden.current = onHidden;
  useEffect(() => {
    if (visible) {
      Animated.spring(progress, { toValue: 1, useNativeDriver: true, friction: 8, tension: 140 }).start();
      return;
    }
    Animated.timing(progress, { toValue: 0, duration: 170, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(({ finished }) => {
      if (finished) hidden.current?.();
    });
  }, [visible, progress]);
  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        style,
        {
          opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) },
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function SegmentRing({ size, depth, total, done, doneColor, emptyColor }: { size: number; depth: number; total: number; done: number; doneColor: string; emptyColor: string }) {
  // Узел вместе с бортиком занимает size + depth по высоте, поэтому кольцо центрируем по этой высоте, а не по лицевой грани.
  const bodyHeight = size + depth;
  const radius = bodyHeight / 2 + RING_CLEARANCE;
  const box = (radius + RING_STROKE) * 2;
  const center = box / 2;
  const span = 360 / total;
  const gap = total === 2 ? 28 : 14;
  return (
    <Svg width={box} height={box} style={{ position: 'absolute', left: size / 2 - center, top: bodyHeight / 2 - center, pointerEvents: 'none' }}>
      {total === 1 ? (
        <Circle cx={center} cy={center} r={radius} stroke={done >= 1 ? doneColor : emptyColor} strokeWidth={RING_STROKE} fill="none" />
      ) : (
        Array.from({ length: total }, (_, index) => (
          <Path
            key={index}
            d={arcPath(center, center, radius, index * span + gap / 2, (index + 1) * span - gap / 2)}
            stroke={index < done ? doneColor : emptyColor}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            fill="none"
          />
        ))
      )}
    </Svg>
  );
}

function LockIcon({ size = 28, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5" stroke={color} strokeWidth={2.3} strokeLinecap="round" fill="none" />
      <Rect x="5" y="10.5" width="14" height="9.5" rx="2.6" fill={color} />
    </Svg>
  );
}

/** Кнопка под последним открытым модулем. Серая и неактивная, пока модуль не пройден; жёлтая, когда можно открыть следующий. */
export function UnlockButton({ width, ready, onPress }: { width: number; ready: boolean; onPress: () => void }) {
  const { colors, scheme } = useTheme();
  const face = ready ? colors.gold : colors.line;
  const rim = ready ? colors.goldShadow : scheme === 'dark' ? '#2A2345' : colors.muted;
  const text = ready ? colors.ink : colors.muted;
  return (
    <Pressable
      disabled={!ready}
      onPress={onPress}
      style={({ pressed }) => [
        { width, height: 58, borderRadius: 18, backgroundColor: face, borderBottomWidth: 5, borderBottomColor: rim, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
        pressed && { transform: [{ translateY: 3 }], borderBottomWidth: 2 },
      ]}
    >
      <LockIcon size={20} color={text} />
      <Text style={{ color: text, fontSize: 16, fontWeight: '900', letterSpacing: 1 }}>РАЗБЛОКИРОВАТЬ</Text>
    </Pressable>
  );
}

/** Появление узлов только что открытого модуля: каждый выпрыгивает по очереди с задержкой. Остальные узлы стоят без анимации. */
export function RevealIn({ enabled, delay, children }: { enabled: boolean; delay: number; children: React.ReactNode }) {
  const progress = useRef(new Animated.Value(enabled ? 0 : 1)).current;
  useEffect(() => {
    if (!enabled) return;
    Animated.spring(progress, { toValue: 1, delay, friction: 6, tension: 110, useNativeDriver: true }).start();
  }, [enabled, delay, progress]);
  return (
    <Animated.View
      style={{
        opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
        transform: [
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) },
          { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Дорога под узлами: широкая полоса с пунктиром посередине. Между соседними точками идёт плавный S-образный изгиб.
 * Точки: центры видимых узлов по порядку.
 */
export function PathRoad({ points, width, height }: { points: { x: number; y: number }[]; width: number; height: number }) {
  const { colors, scheme } = useTheme();
  if (points.length < 2) return null;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1];
    const to = points[i];
    const bend = (to.y - from.y) / 2;
    d += ` C ${from.x} ${from.y + bend} ${to.x} ${to.y - bend} ${to.x} ${to.y}`;
  }
  const road = scheme === 'dark' ? '#241E40' : colors.line;
  const dash = scheme === 'dark' ? '#3B3363' : colors.white;
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
      <Path d={d} stroke={road} strokeWidth={ROAD_WIDTH} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={d} stroke={dash} strokeWidth={4} strokeLinecap="round" strokeDasharray="14 18" fill="none" />
    </Svg>
  );
}