import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabs } from '../components/bottom-tabs';
import { DEMO_MODE } from '../core/config';
import { ThemeProvider, useTheme } from '../core/theme-context';
import { LanguageProvider } from '../core/language-context';
import { ThemeColors } from '../core/theme';
import { AuthPayload, AuthSession, DailyQuota, Progress, Section, Tab } from '../core/types';
import { AuthScreen } from '../features/auth/auth-screen';
import { DashboardScreen } from '../features/dashboard/dashboard-screen';
import { PracticeLanding, PracticeSession } from '../features/practice/practice-flow';
import { ProfileScreen } from '../features/profile/profile-screen';
import { StudyLesson, StudyPath } from '../features/study/study-flow';
import { ApiError, authenticate, createApi } from '../services/api';
import { sessionStore } from '../services/session';

type Overlay = { kind: 'PRACTICE'; section: Section } | { kind: 'LESSON'; level: number } | null;
const defaultProgress: Progress = { math: { level: 0, of: 42 }, readingWriting: { level: 0, of: 42 }, overall: { level: 0, of: 84 } };

export default function AppRoot() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AppRootInner />
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppRootInner() {
  const { colors, scheme } = useTheme();
  const styles = makeStyles(colors);
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [tab, setTab] = useState<Tab>('HOME');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [studyVersion, setStudyVersion] = useState(0);
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [quota, setQuota] = useState<DailyQuota>({ math: 0, readingWriting: 0 });
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const signOut = useCallback(async () => {
    await sessionStore.clear();
    setSession(null);
    setTab('HOME');
    setOverlay(null);
    setProgress(defaultProgress);
    setQuota({ math: 0, readingWriting: 0 });
  }, []);
  const api = useMemo(() => (session ? createApi(session.accessToken, signOut) : null), [session, signOut]);

  useEffect(() => {
    const restore = async () => {
      const token = await sessionStore.read();
      if (!token) {
        setBooting(false);
        return;
      }
      const restoredApi = createApi(token, () => void signOut());
      try {
        setSession({ accessToken: token, user: await restoredApi.getProfile() });
      } catch {
        await sessionStore.clear();
      } finally {
        setBooting(false);
      }
    };
    restore();
  }, [signOut]);

  const refreshDashboard = useCallback(() => {
    if (!api) return;
    api
      .getDashboard()
      .then(({ progress: freshProgress, quota: freshQuota }) => {
        setProgress(freshProgress);
        setQuota(freshQuota);
        setDashboardError(null);
      })
      .catch((caught) => {
        if (!(caught instanceof ApiError && caught.status === 401)) setDashboardError(caught instanceof Error ? caught.message : 'Could not load your progress.');
      });
  }, [api]);
  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const handleAuth = async (mode: 'LOGIN' | 'REGISTER', payload: AuthPayload) => {
  const next = await authenticate(mode, payload);
  await sessionStore.save(next);
  setSession(next);
  // Ответ /auth/login и /auth/register содержит только id/email/role —
  // сразу дозапрашиваем полный профиль (fullName, age и т.д.), иначе
  // Dashboard упадёт на user.fullName сразу после логина.
  try {
    const fullProfile = await createApi(next.accessToken, signOut).getProfile();
    setSession({ ...next, user: fullProfile });
  } catch {
    // не критично — Dashboard всё равно перезапросит профиль при следующем refreshUser
  }
};
  const handleOAuthPress = async (provider: 'GOOGLE' | 'APPLE') => {
    // TODO: подключить реальный OAuth-флоу (нативный sign-in + обмен токена на бэке)
    throw new Error(`${provider} sign-in ещё не реализован.`);
  };
  const refreshUser = async () => {
    if (!api || !session) return;
    try {
      setSession({ ...session, user: await api.getProfile() });
    } catch (caught) {
      setDashboardError(caught instanceof Error ? caught.message : 'Could not refresh your profile.');
    }
  };
  const beginPractice = (section: Section) => {
    setOverlay({ kind: 'PRACTICE', section });
    setTab('PRACTICE');
  };

  if (booting) return <Splash />;
  if (!session) return <AuthScreen onAuthenticate={handleAuth} onOAuthPress={handleOAuthPress} />;
  if (!api) return null;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {DEMO_MODE ? (
        <View style={styles.demo}>
          <Text style={styles.demoText}>DEMO MODE · API-READY</Text>
        </View>
      ) : null}
      <View style={styles.content}>
        {overlay?.kind === 'PRACTICE' ? (
          <PracticeSession
            api={api}
            section={overlay.section}
            quota={quota}
            onQuotaChange={setQuota}
            onClose={() => {
              setOverlay(null);
              refreshDashboard();
            }}
          />
        ) : overlay?.kind === 'LESSON' ? (
          <StudyLesson
            api={api}
            level={overlay.level}
            onClose={() => {
              setOverlay(null);
              setStudyVersion((value) => value + 1);
            }}
          />
        ) : tab === 'HOME' ? (
          <DashboardScreen user={session.user} progress={progress} quota={quota} onPractice={beginPractice} />
        ) : tab === 'PRACTICE' ? (
          <PracticeLanding progress={progress} quota={quota} onStart={beginPractice} />
        ) : tab === 'STUDY' ? (
          <StudyPath api={api} refreshToken={studyVersion} onOpenLevel={(level) => setOverlay({ kind: 'LESSON', level })} />
        ) : (
          <ProfileScreen user={session.user} onLogout={signOut} onRefresh={() => void refreshUser()} />
        )}
      </View>
      {dashboardError ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{dashboardError}</Text>
          <Pressable onPress={refreshDashboard}>
            <Text style={styles.retry}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
      {!overlay ? <BottomTabs active={tab} onChange={setTab} /> : null}
    </SafeAreaView>
  );
}

function Splash() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <SafeAreaView style={styles.splash} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <View style={styles.mark}>
        <Text style={styles.markText}>S</Text>
      </View>
      <Text style={styles.splashTitle}>SAT GG</Text>
      <Text style={styles.splashSub}>Your score starts here</Text>
      <ActivityIndicator size="large" color={colors.gold} style={{ marginTop: 34 }} />
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.cloud },
    content: { flex: 1 },
    demo: { position: 'absolute', zIndex: 10, right: 15, top: 8, backgroundColor: '#322A5C', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 },
    demoText: { color: colors.gold, fontSize: 9, letterSpacing: 0.8, fontWeight: '900' },
    banner: { padding: 9, paddingHorizontal: 16, backgroundColor: '#FFF0F1', borderTopColor: '#FFC1CA', borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
    bannerText: { color: '#A13648', fontWeight: '700', fontSize: 12, flex: 1 },
    retry: { color: colors.purple, fontWeight: '900', fontSize: 12 },
    splash: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.purple },
    mark: { width: 92, height: 92, borderRadius: 32, backgroundColor: colors.gold, borderBottomWidth: 7, borderBottomColor: colors.goldShadow, alignItems: 'center', justifyContent: 'center' },
    markText: { fontWeight: '900', fontSize: 51, color: colors.ink },
    splashTitle: { marginTop: 20, color: colors.white, fontWeight: '900', fontSize: 34, letterSpacing: 1.4 },
    splashSub: { marginTop: 6, color: '#DCD7FF', fontSize: 15, fontWeight: '700' },
  });
}