import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../core/theme-context';
import { LanguageProvider } from '../core/language-context';
import { ThemeColors } from '../core/theme';
import { Section, Tab } from '../core/types';
import { AuthScreen } from '../features/auth/auth-screen';
import { OnboardingFlow } from '../features/onboarding/OnboardingFlow';
import { OnboardingAnswers } from '../features/onboarding/types';
import { createApi } from '../services/api';
import { useSession } from '../hooks/useSession';
import { useDashboardData } from '../hooks/useDashboardData';
import { MainNavigator } from './MainNavigator';

type Overlay = { kind: 'PRACTICE'; section: Section } | { kind: 'LESSON'; level: number } | null;

const ONBOARDING_DONE_KEY = 'sat_gg_onboarding_done';

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

  const { booting, session, setSession, signOut, handleAuth, handleOAuthPress } = useSession();
  const api = useMemo(() => (session ? createApi(session.accessToken, signOut) : null), [session, signOut]);
  const { progress, quota, setQuota, dashboardError, refreshDashboard } = useDashboardData(api);

  const [tab, setTab] = useState<Tab>('HOME');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [studyVersion, setStudyVersion] = useState(0);

  // null = ещё не проверили AsyncStorage, true/false = проверили
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [onboardingAnswers, setOnboardingAnswers] = useState<OnboardingAnswers | null>(null);

  // TODO: поставь false, когда закончишь гонять опросник — иначе онбординг
  // будет сбрасываться при каждом запуске приложения.
  const FORCE_RESET_ONBOARDING_FOR_TESTING = true;

  useEffect(() => {
    (async () => {
      if (__DEV__ && FORCE_RESET_ONBOARDING_FOR_TESTING) {
        await AsyncStorage.removeItem(ONBOARDING_DONE_KEY);
      }
      const value = await AsyncStorage.getItem(ONBOARDING_DONE_KEY);
      setOnboardingDone(value === 'true');
    })();
  }, []);

  const handleOnboardingComplete = async (answers: OnboardingAnswers) => {
    setOnboardingAnswers(answers);
    // TODO: когда появится бэкенд-эндпоинт — отправить answers одним batch-запросом
    // сразу после первой успешной регистрации (см. архитектурное решение по онбордингу)
    await AsyncStorage.setItem(ONBOARDING_DONE_KEY, 'true');
    setOnboardingDone(true);
  };

  const refreshUser = async () => {
    if (!api || !session) return;
    try {
      setSession({ ...session, user: await api.getProfile() });
    } catch {}
  };

  if (booting || onboardingDone === null) return <Splash colors={colors} />;
  if (!onboardingDone) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onAuthenticate={handleAuth}
        onOAuthPress={handleOAuthPress}
      />
    );
  }
  if (!session) return <AuthScreen onAuthenticate={handleAuth} onOAuthPress={handleOAuthPress} />;
  if (!api) return null;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <MainNavigator
        colors={colors} api={api} session={session}
        tab={tab} setTab={setTab} overlay={overlay} setOverlay={setOverlay}
        studyVersion={studyVersion} setStudyVersion={setStudyVersion}
        progress={progress} quota={quota} setQuota={setQuota}
        dashboardError={dashboardError} refreshDashboard={refreshDashboard}
        signOut={signOut} refreshUser={refreshUser}
      />
    </SafeAreaView>
  );
}

function Splash({ colors }: { colors: ThemeColors }) {
  const styles = makeStyles(colors);
  return (
    <SafeAreaView style={styles.splash} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <View style={styles.mark}>
        <Image source={require('../assets/logo.png')} style={styles.markImage} resizeMode="contain" />
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
    splash: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.purple },
    mark: { width: 92, height: 92, borderRadius: 32, backgroundColor: colors.gold, borderBottomWidth: 7, borderBottomColor: colors.goldShadow, alignItems: 'center', justifyContent: 'center' },
    markImage: { width: 64, height: 64 },
    splashTitle: { marginTop: 20, color: colors.white, fontWeight: '900', fontSize: 34, letterSpacing: 1.4 },
    splashSub: { marginTop: 6, color: '#DCD7FF', fontSize: 15, fontWeight: '700' },
  });
}