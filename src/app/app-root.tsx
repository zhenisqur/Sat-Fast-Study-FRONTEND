import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../core/theme-context';
import { LanguageProvider } from '../core/language-context';
import { ThemeColors } from '../core/theme';
import { Section, Tab } from '../core/types';
import { AuthScreen } from '../features/auth/auth-screen';
import { createApi } from '../services/api';
import { useSession } from '../hooks/useSession';
import { useDashboardData } from '../hooks/useDashboardData';
import { MainNavigator } from './MainNavigator';

type Overlay = { kind: 'PRACTICE'; section: Section } | { kind: 'LESSON'; level: number } | null;

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

  const refreshUser = async () => {
    if (!api || !session) return;
    try {
      setSession({ ...session, user: await api.getProfile() });
    } catch {}
  };

  if (booting) return <Splash colors={colors} />;
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
      <View style={styles.mark}><Text style={styles.markText}>S</Text></View>
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
    markText: { fontWeight: '900', fontSize: 51, color: colors.ink },
    splashTitle: { marginTop: 20, color: colors.white, fontWeight: '900', fontSize: 34, letterSpacing: 1.4 },
    splashSub: { marginTop: 6, color: '#DCD7FF', fontSize: 15, fontWeight: '700' },
  });
}