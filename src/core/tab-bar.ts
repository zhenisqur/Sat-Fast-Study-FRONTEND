import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Высота парящей панели вкладок (таблетки). */
export const TAB_BAR_HEIGHT = 64;
/** Боковые поля панели. */
export const TAB_BAR_SIDE_MARGIN = 20;

/** Отступ панели от нижнего края экрана: чуть выше индикатора «домой». */
export function tabBarBottomOffset(insetBottom: number): number {
  return Math.max(insetBottom - 4, 12);
}

/**
 * Сколько места оставить снизу в прокручиваемом контенте, чтобы последний элемент
 * можно было прокрутить выше панели. Контент при этом заезжает под стекло.
 */
export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + tabBarBottomOffset(insets.bottom) + 16;
}