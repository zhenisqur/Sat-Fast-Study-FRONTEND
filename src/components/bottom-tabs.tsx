import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../core/theme-context';
import { Tab } from '../core/types';
import { useLanguage } from '../core/language-context';
import { TAB_BAR_HEIGHT, TAB_BAR_SIDE_MARGIN, tabBarBottomOffset } from '../core/tab-bar';

type IonName = React.ComponentProps<typeof Ionicons>['name'];

interface TabItem {
  id: Tab;
  label: string;
  iconOn: IonName;
  iconOff: IonName;
}

const PAD = 6;
// Настоящее «жидкое стекло» есть только на iOS 26+. Иначе используем размытие.
const HAS_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable();

function useTabItems(): TabItem[] {
  const { t } = useLanguage();
  return [
    { id: 'HOME', label: t('tabs.home'), iconOn: 'home', iconOff: 'home-outline' },
    { id: 'STUDY', label: t('tabs.study'), iconOn: 'map', iconOff: 'map-outline' },
    { id: 'PRACTICE', label: t('tabs.practice'), iconOn: 'barbell', iconOff: 'barbell-outline' },
    { id: 'PROFILE', label: t('tabs.profile'), iconOn: 'person', iconOff: 'person-outline' },
  ];
}

/** Тёмная ли тема: считаем по яркости фона приложения, чтобы не зависеть от API темы. */
function isDarkColor(color: string): boolean {
  let r = 20;
  let g = 16;
  let b = 33;
  const value = color.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(value);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].split('').map((c) => c + c).join('') : hex[1];
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
  } else if (rgb) {
    r = Number(rgb[1]);
    g = Number(rgb[2]);
    b = Number(rgb[3]);
  }
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

export function BottomTabs({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const { colors } = useTheme();
  const items = useTabItems();
  const insets = useSafeAreaInsets();
  const isDark = isDarkColor(colors.cloud);

  const activeColor = isDark ? colors.gold : colors.purple;
  const idleColor = isDark ? 'rgba(255,255,255,0.72)' : 'rgba(20,16,33,0.6)';

  const [rowWidth, setRowWidth] = useState(0);
  const itemWidth = rowWidth > 0 ? (rowWidth - PAD * 2) / items.length : 0;
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === active));

  // «Линза» под выбранной вкладкой скользит между пунктами.
  const lensX = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);
  useEffect(() => {
    if (itemWidth === 0) return;
    const to = activeIndex * itemWidth;
    if (!placed.current) {
      lensX.setValue(to);
      placed.current = true;
      return;
    }
    Animated.spring(lensX, { toValue: to, useNativeDriver: true, friction: 9, tension: 110 }).start();
  }, [activeIndex, itemWidth, lensX]);

  const onRowLayout = (e: LayoutChangeEvent) => setRowWidth(e.nativeEvent.layout.width);

  const lensHeight = TAB_BAR_HEIGHT - PAD * 2;
  const lensColors: [string, string] = isDark
    ? ['rgba(255,255,255,0.24)', 'rgba(255,255,255,0.05)']
    : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.45)'];
  const lensBorder = isDark ? 'rgba(255,255,255,0.30)' : 'rgba(20,16,33,0.10)';

  const content = (
    <View style={styles.row} onLayout={onRowLayout}>
      {itemWidth > 0 ? (
        <Animated.View
          style={[
            styles.lens,
            {
              width: itemWidth,
              height: lensHeight,
              borderRadius: lensHeight / 2,
              borderColor: lensBorder,
              transform: [{ translateX: lensX }],
            },
          ]}
        >
          <LinearGradient colors={lensColors} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : null}
      {items.map((item) => (
        <TabButton
          key={item.id}
          item={item}
          isActive={active === item.id}
          activeColor={activeColor}
          idleColor={idleColor}
          onPress={() => onChange(item.id)}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.wrap, { bottom: tabBarBottomOffset(insets.bottom) }]}>
      {HAS_GLASS ? (
        <GlassView style={styles.pill} glassEffectStyle="regular">
          {content}
        </GlassView>
      ) : Platform.OS === 'ios' ? (
        <BlurView
          intensity={70}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.pill, styles.pillClip, { borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(20,16,33,0.08)' }]}
        >
          {content}
        </BlurView>
      ) : (
        <View
          style={[
            styles.pill,
            styles.pillClip,
            {
              backgroundColor: isDark ? 'rgba(34,27,58,0.96)' : 'rgba(255,255,255,0.96)',
              borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(20,16,33,0.08)',
            },
          ]}
        >
          {content}
        </View>
      )}
    </View>
  );
}

function TabButton({
  item,
  isActive,
  activeColor,
  idleColor,
  onPress,
}: {
  item: TabItem;
  isActive: boolean;
  activeColor: string;
  idleColor: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) return;
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.14, useNativeDriver: true, speed: 40, bounciness: 9 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }),
    ]).start();
  }, [isActive, scale]);

  const handlePress = () => {
    if (!isActive) Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };

  const color = isActive ? activeColor : idleColor;

  return (
    <Pressable
      onPress={handlePress}
      style={styles.item}
      hitSlop={6}
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name={isActive ? item.iconOn : item.iconOff} size={24} color={color} />
      </Animated.View>
      <Text numberOfLines={1} style={[styles.label, isActive && styles.labelActive, { color }]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Панель лежит поверх экрана, поэтому сама не перехватывает касания вокруг таблетки.
  wrap: {
    position: 'absolute',
    left: TAB_BAR_SIDE_MARGIN,
    right: TAB_BAR_SIDE_MARGIN,
    pointerEvents: 'box-none',
  },
  pill: {
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
  },
  pillClip: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: PAD,
  },
  lens: {
    position: 'absolute',
    top: PAD,
    left: PAD,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    pointerEvents: 'none',
  },
  item: {
    flex: 1,
    height: TAB_BAR_HEIGHT - PAD * 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: { fontSize: 10, fontWeight: '700' },
  labelActive: { fontWeight: '900' },
});