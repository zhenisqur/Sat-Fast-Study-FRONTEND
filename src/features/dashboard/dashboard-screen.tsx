import React, { useMemo, useState } from 'react';
import { Image, ImageSourcePropType, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../core/theme-context';
import { ThemeColors } from '../../core/theme';
import { haptics } from '../../core/haptics';
import { useTabBarInset } from '../../core/tab-bar';
import { DailyQuota, Progress, Section, User } from '../../core/types';
import { bannerPalette, getDailyMascot } from './daily-mascot';

const DAILY_GOAL = 30;
const QUEST_TARGET = 15;

// ДЕМО: серии и XP на сервере пока нет. Когда появятся данные, заменить эти значения реальными.
const DEMO = { streak: 3, xp: 175 };

// Картинки маскотов квадратные: низ картинки совпадает с верхом тёмного блока, а у маскота обрезано туловище.
const MASCOT_SIZE = 230;
// Пока шапка ещё видна у верхнего края (высота 290 минус заход тёмного блока), системная строка остаётся цвета шапки.
const STATUS_FILL_UNTIL = 240;

/** Сколько часов осталось до смены дня. Квота на бэке считается по суткам UTC, поэтому считаем до полуночи UTC. */
function hoursLeftToday(): number {
  const now = new Date();
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.ceil((end - now.getTime()) / 3600000));
}

export function DashboardScreen({ user, quota, onPractice }: { user: User; progress: Progress; quota: DailyQuota; onPractice: (section: Section) => void }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  // Маскот дня и цвета шапки под него (шапка красится в цвет фона картинки).
  const mascot = useMemo(() => getDailyMascot(), []);
  const palette = bannerPalette(mascot.background);
  const scale = mascot.scale ?? 1;
  const offsetY = mascot.offsetY ?? 0;
  // Пока экран не прокручен, шапка продолжается под системной строкой, а иконки в ней тёмные.
  const [atTop, setAtTop] = useState(true);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const top = event.nativeEvent.contentOffset.y <= STATUS_FILL_UNTIL;
    setAtTop((previous) => (previous === top ? previous : top));
  };
  // Контент прокручивается под парящую панель вкладок, поэтому снизу оставляем запас.
  const bottomInset = useTabBarInset();
  const firstName = (user.fullName ?? '').trim().split(' ')[0];
  const done = quota.math + quota.readingWriting;
  const goalFill = Math.min(1, done / DAILY_GOAL);

  return (
    <View style={styles.screen}>
    {atTop ? <StatusBar style={palette.statusBar} /> : null}
    {atTop ? <View style={[styles.statusFill, { top: -insets.top, height: insets.top, backgroundColor: mascot.background }]} /> : null}
    <ScrollView
      contentContainerStyle={{ paddingBottom: bottomInset }}
      scrollIndicatorInsets={{ bottom: bottomInset - 16 }}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <View style={[styles.banner, { backgroundColor: mascot.background }]}>
        <View style={[styles.overscrollFill, { backgroundColor: mascot.background }]} />
        <View style={styles.mascotClip}>
          <Image
            source={mascot.image}
            resizeMode="contain"
            style={[styles.mascot, (scale !== 1 || offsetY !== 0) && { transform: [{ translateY: (-(scale - 1) * MASCOT_SIZE) / 2 + offsetY }, { scale }] }]}
          />
        </View>
        <Text style={[styles.kicker, { color: palette.accent }]} numberOfLines={1}>{firstName ? `ПРИВЕТ, ${firstName.toUpperCase()}` : 'ПРИВЕТ'}</Text>
        <Text style={[styles.title, { color: palette.text }]}>{mascot.title}</Text>
        <View style={styles.chips}>
          <View style={styles.chip}>
            <Ionicons name="flame" size={15} color="#FF9F43" />
            <Text style={[styles.chipText, { color: '#FF9F43' }]}>{DEMO.streak} дня</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="flash" size={15} color={colors.gold} />
            <Text style={[styles.chipText, { color: colors.gold }]}>{DEMO.xp} XP</Text>
          </View>
        </View>
      </View>

      <View style={styles.goal}>
        <View style={styles.goalTop}>
          <Text style={styles.goalTitle}>Цель дня</Text>
          <Text style={styles.goalCount}>{done} / {DAILY_GOAL}</Text>
        </View>
        <View style={styles.goalRail}>
          <View style={[styles.goalFill, { width: `${goalFill * 100}%` }]} />
        </View>
        <Text style={styles.goalCopy}>Выполни 30 задач за сегодня</Text>
      </View>

      <View style={styles.quests}>
        <View style={styles.questsHead}>
          <Text style={styles.sectionLabel}>Норматив дня</Text>
          <View style={styles.timer}>
            <Ionicons name="time-outline" size={16} color="#FF9F43" />
            <Text style={styles.timerText}>ОСТАЛОСЬ {hoursLeftToday()} Ч</Text>
          </View>
        </View>
        <Quest colors={colors} title="Математика: 15 задач" chest={require('../../assets/mascot/math.png')} value={quota.math} onPress={() => onPractice('MATH')} />
        <Quest colors={colors} title="Грамматика: 15 задач" chest={require('../../assets/mascot/grammar.png')} value={quota.readingWriting} onPress={() => onPractice('READING_WRITING')} last />
      </View>
    </ScrollView>
    </View>
  );
}

function Quest({ colors, title, chest, value, onPress, last }: { colors: ThemeColors; title: string; chest: ImageSourcePropType; value: number; onPress: () => void; last?: boolean }) {
  const styles = makeStyles(colors);
  const finished = value >= QUEST_TARGET;
  const fill = Math.min(1, value / QUEST_TARGET);
  const handlePress = () => {
    haptics.select();
    onPress();
  };
  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [styles.quest, !last && styles.questDivider, pressed && styles.questPressed]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.questTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.rail}>
          <View style={[styles.railFill, { width: `${fill * 100}%` }]} />
          <View style={styles.railLabelWrap}>
            <Text style={styles.railLabel}>{finished ? 'Готово' : `${value} / ${QUEST_TARGET}`}</Text>
          </View>
        </View>
      </View>
      <Image source={chest} resizeMode="contain" style={[styles.chest, finished && styles.chestDone]} />
    </Pressable>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1 },
    // Если потянуть экран вниз, над шапкой появляется пустое место: закрашиваем его тем же жёлтым.
    overscrollFill: { position: 'absolute', left: 0, right: 0, top: -1200, height: 1200 },
    statusFill: { position: 'absolute', left: 0, right: 0 },
    banner: { height: 290, paddingTop: 18, paddingHorizontal: 20 },
    kicker: { fontSize: 22, fontWeight: '900', letterSpacing: 1 },
    title: { width: 170, marginTop: 6, fontSize: 30, lineHeight: 33, fontWeight: '900' },
    chips: { flexDirection: 'row', gap: 8, marginTop: 16 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 12, backgroundColor: colors.ink },
    chipText: { fontSize: 13, fontWeight: '900' },
    // Обрезаем всё, что у увеличенной картинки выходит за шапку, иначе оно просвечивает ниже тёмного блока.
    mascotClip: { ...StyleSheet.absoluteFill, overflow: 'hidden', pointerEvents: 'none' },
    mascot: { position: 'absolute', right: -4, bottom: 26, width: MASCOT_SIZE, height: MASCOT_SIZE, pointerEvents: 'none' },

    goal: { marginTop: -34, paddingTop: 22, paddingBottom: 4, paddingHorizontal: 20, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.cloud },
    goalTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    goalTitle: { color: colors.text, fontSize: 19, fontWeight: '900' },
    goalCount: { color: colors.text, fontSize: 15, fontWeight: '900' },
    goalRail: { height: 18, marginTop: 12, borderRadius: 9, backgroundColor: '#4B4372', overflow: 'hidden' },
    goalFill: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.gold },
    goalCopy: { marginTop: 10, color: colors.muted, fontSize: 14, fontWeight: '800' },

    quests: { marginTop: 30, paddingHorizontal: 16 },
    questsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionLabel: { color: colors.muted, fontSize: 13, fontWeight: '800', letterSpacing: 1.1 },
    timer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    timerText: { color: '#FF9F43', fontSize: 13, fontWeight: '900' },
    quest: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 18 },
    questDivider: { borderBottomWidth: 2, borderBottomColor: colors.line },
    questPressed: { opacity: 0.85 },
    questTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
    rail: { height: 18, marginTop: 12, borderRadius: 9, backgroundColor: '#4B4372', overflow: 'hidden' },
    railFill: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.purple },
    railLabelWrap: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
    railLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
    chest: { width: 76, height: 76 },
    chestDone: { opacity: 0.55 },
  });
}