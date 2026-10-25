import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabs } from '../components/bottom-tabs';
import { DEMO_MODE } from '../core/config';
import { TAB_BAR_HEIGHT, tabBarBottomOffset } from '../core/tab-bar';
import { ThemeColors } from '../core/theme';
import { AuthSession, DailyQuota, Progress, Section, Tab } from '../core/types';
import { DashboardScreen } from '../features/dashboard/dashboard-screen';
import { LessonDemoScreen } from '../features/lesson-demo/lesson-demo-screen';
import { PracticeLanding, PracticeSession } from '../features/practice/practice-flow';
import { ProfileScreen } from '../features/profile/profile-screen';
import { StudyLesson, StudyPath } from '../features/study/study-flow';
import { Api } from '../services/api';

type Overlay = { kind: 'PRACTICE'; section: Section } | { kind: 'LESSON'; level: number } | null;

// ТЕСТ нового экрана урока. true: карточки на главной и во вкладке "Тренировка" открывают тестовый урок
// с вопросами, заведёнными вручную. false: открывается прежняя практика с бэка.
const USE_LESSON_DEMO = true;

export function MainNavigator({
  colors, api, session, tab, setTab, overlay, setOverlay,
  studyVersion, setStudyVersion, progress, quota, setQuota,
  dashboardError, refreshDashboard, signOut, refreshUser,
}: {
  colors: ThemeColors;
  api: Api;
  session: AuthSession;
  tab: Tab;
  setTab: (t: Tab) => void;
  overlay: Overlay;
  setOverlay: (o: Overlay) => void;
  studyVersion: number;
  setStudyVersion: (fn: (v: number) => number) => void;
  progress: Progress;
  quota: DailyQuota;
  setQuota: (q: DailyQuota) => void;
  dashboardError: string | null;
  refreshDashboard: () => void;
  signOut: () => void;
  refreshUser: () => void;
}) {
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  // Вкладку не переключаем: после урока человек возвращается туда, откуда его открыл (с главной на главную).
  const beginPractice = (section: Section) => { setOverlay({ kind: 'PRACTICE', section }); };

  // Панель вкладок парит поверх контента, а баннер ошибки стоит над ней (или у нижнего края, если панели нет).
  const barVisible = !overlay;
  const bannerBottom = barVisible
    ? tabBarBottomOffset(insets.bottom) + TAB_BAR_HEIGHT + 10
    : Math.max(insets.bottom, 12);

  return (
    <View style={styles.root}>
      {DEMO_MODE ? (
        <View style={styles.demo}><Text style={styles.demoText}>DEMO MODE · API-READY</Text></View>
      ) : null}
      <View style={styles.content}>
        {overlay?.kind === 'PRACTICE' && USE_LESSON_DEMO ? (
          <LessonDemoScreen section={overlay.section} onClose={() => { setOverlay(null); refreshDashboard(); }} />
        ) : overlay?.kind === 'PRACTICE' ? (
          <PracticeSession api={api} section={overlay.section} quota={quota} onQuotaChange={setQuota}
            onClose={() => { setOverlay(null); refreshDashboard(); }} />
        ) : overlay?.kind === 'LESSON' ? (
          <StudyLesson api={api} level={overlay.level}
            onClose={() => { setOverlay(null); setStudyVersion((v) => v + 1); }} />
        ) : tab === 'HOME' ? (
          <DashboardScreen user={session.user} progress={progress} quota={quota} onPractice={beginPractice} />
        ) : tab === 'PRACTICE' ? (
          <PracticeLanding progress={progress} quota={quota} onStart={beginPractice} />
        ) : tab === 'STUDY' ? (
          <StudyPath api={api} refreshToken={studyVersion} onOpenLevel={(level) => setOverlay({ kind: 'LESSON', level })} />
        ) : (
          <ProfileScreen user={session.user} onLogout={signOut} onRefresh={refreshUser} />
        )}
      </View>
      {dashboardError ? (
        <View style={[styles.banner, { bottom: bannerBottom }]}>
          <Text style={styles.bannerText}>{dashboardError}</Text>
          <Pressable onPress={refreshDashboard}><Text style={styles.retry}>Retry</Text></Pressable>
        </View>
      ) : null}
      {barVisible ? <BottomTabs active={tab} onChange={setTab} /> : null}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    content: { flex: 1 },
    demo: { position: 'absolute', zIndex: 10, right: 15, top: 8, backgroundColor: '#322A5C', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 },
    demoText: { color: colors.gold, fontSize: 9, letterSpacing: 0.8, fontWeight: '900' },
    banner: { position: 'absolute', left: 16, right: 16, zIndex: 20, padding: 9, paddingHorizontal: 16, backgroundColor: '#FFF0F1', borderColor: '#FFC1CA', borderWidth: 1, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
    bannerText: { color: '#A13648', fontWeight: '700', fontSize: 12, flex: 1 },
    retry: { color: colors.purple, fontWeight: '900', fontSize: 12 },
  });
}