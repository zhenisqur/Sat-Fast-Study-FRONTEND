import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GoogleLogo } from '../../components/uis/GoogleLogo';
import { Field, GameButton } from '../../components/ui';
import { useTheme } from '../../core/theme-context';
import { ThemeColors } from '../../core/theme';
import { AuthPayload } from '../../core/types';

interface AuthScreenProps {
  onAuthenticate: (mode: 'LOGIN' | 'REGISTER', payload: AuthPayload) => Promise<void>;
  onOAuthPress: (provider: 'GOOGLE' | 'APPLE') => Promise<void>;
}

export function AuthScreen({ onAuthenticate, onOAuthPress }: AuthScreenProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('aidan@example.com');
  const [password, setPassword] = useState('satmaster');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [hasTakenSatBefore, setHasTakenSatBefore] = useState(false);
  const [previousSatScore, setPreviousSatScore] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<'GOOGLE' | 'APPLE' | null>(null);
  const register = mode === 'REGISTER';

  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    const payload: AuthPayload = { email, password };
    if (register) {
      const ageNumber = Number(age);
      if (!fullName.trim()) return setError('Tell us your name.');
      if (!Number.isInteger(ageNumber) || ageNumber < 1) return setError('Enter your age using digits only.');
      if (hasTakenSatBefore && (!Number(previousSatScore) || Number(previousSatScore) < 400 || Number(previousSatScore) > 1600)) return setError('Previous SAT score must be from 400 to 1600.');
      Object.assign(payload, { fullName: fullName.trim(), age: ageNumber, hasTakenSatBefore });
      if (hasTakenSatBefore) payload.previousSatScore = Number(previousSatScore);
    }
    setError('');
    setBusy(true);
    try {
      await onAuthenticate(mode, payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not continue.');
    } finally {
      setBusy(false);
    }
  };

  const handleOAuth = async (provider: 'GOOGLE' | 'APPLE') => {
    setError('');
    setOauthBusy(provider);
    try {
      await onOAuthPress(provider);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not continue.');
    } finally {
      setOauthBusy(null);
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <Image source={require('../../assets/logo.png')} style={styles.brand} resizeMode="contain" />
        <Text style={styles.eyebrow}>{register ? 'LET’S GET STARTED' : 'WELCOME BACK'}</Text>
        <Text style={styles.title}>{register ? 'Build your SAT game plan' : 'Ready for a win?'}</Text>
        <Text style={styles.subtitle}>{register ? 'A few details help us personalize your path.' : 'Pick up exactly where you left off.'}</Text>
      </View>

      <View style={styles.card}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[styles.cardContent, { paddingBottom: 36 + insets.bottom }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {register ? (
              <>
                <Field label="Full name" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
                <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <Field label="Password" hint="Minimum 8 characters" value={password} onChangeText={setPassword} secureTextEntry />
                <Field label="Age" value={age} onChangeText={(value) => setAge(value.replace(/[^0-9]/g, ''))} keyboardType="number-pad" />

                <View style={styles.toggle}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleTitle}>Taken the SAT before?</Text>
                    <Text style={styles.toggleHint}>We’ll tailor your start point.</Text>
                  </View>
                  <View style={styles.switchWrap}>
                    <Switch
                      value={hasTakenSatBefore}
                      onValueChange={setHasTakenSatBefore}
                      trackColor={{ false: '#B8B2D8', true: colors.gold }}
                      thumbColor={colors.white}
                      ios_backgroundColor="#B8B2D8"
                    />
                  </View>
                </View>

                {hasTakenSatBefore ? (
                  <Field
                    label="Previous SAT score"
                    hint="400–1600"
                    value={previousSatScore}
                    onChangeText={(value) => setPreviousSatScore(value.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                  />
                ) : null}
              </>
            ) : (
              <>
                <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
              </>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <GameButton label={busy ? 'One moment…' : register ? 'Create my plan' : 'Log in'} onPress={submit} disabled={busy} />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable style={[styles.oauthButton, oauthBusy === 'GOOGLE' && styles.oauthButtonBusy]} onPress={() => handleOAuth('GOOGLE')} disabled={oauthBusy !== null}>
              <GoogleLogo size={18} />
              <Text style={[styles.oauthButtonText, { marginLeft: 10 }]}>{oauthBusy === 'GOOGLE' ? 'One moment…' : 'Continue with Google'}</Text>
            </Pressable>

            {Platform.OS === 'ios' ? (
              <Pressable style={[styles.oauthButton, styles.oauthButtonDark, oauthBusy === 'APPLE' && styles.oauthButtonBusy]} onPress={() => handleOAuth('APPLE')} disabled={oauthBusy !== null}>
                <Ionicons name="logo-apple" size={20} color={colors.white} style={styles.oauthIcon} />
                <Text style={styles.oauthButtonTextDark}>{oauthBusy === 'APPLE' ? 'One moment…' : 'Continue with Apple'}</Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => {
                setMode(register ? 'LOGIN' : 'REGISTER');
                setError('');
              }}
              style={styles.link}
            >
              <Text style={styles.linkText}>
                {register ? 'Already have an account? ' : 'New here? '}
                <Text style={styles.linkStrong}>{register ? 'Log in' : 'Create an account'}</Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.purple },
    hero: { paddingHorizontal: 26, paddingBottom: 28 },
    brand: { width: 44, height: 44, borderRadius: 16, marginBottom: 24 },
    eyebrow: { color: colors.gold, fontWeight: '900', fontSize: 11, letterSpacing: 1.4 },
    title: { fontSize: 31, fontWeight: '900', color: colors.white, lineHeight: 37, marginTop: 7 },
    subtitle: { fontSize: 15, color: '#E3DFFF', lineHeight: 22, marginTop: 8 },
    card: { flex: 1, backgroundColor: colors.cloud, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
    cardContent: { padding: 24, flexGrow: 1 },
    toggle: { minHeight: 66, borderRadius: 15, borderColor: colors.line, borderWidth: 1.5, backgroundColor: colors.white, paddingHorizontal: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
    switchWrap: { width: 51, height: 31, alignItems: 'center', justifyContent: 'center' },
    toggleTitle: { color: colors.text, fontWeight: '800', fontSize: 14 },
    toggleHint: { color: colors.muted, fontSize: 12, marginTop: 3 },
    error: { color: '#C53D51', fontWeight: '700', fontSize: 13, marginBottom: 13 },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, gap: 10 },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
    dividerText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
    oauthButton: { flexDirection: 'row', borderWidth: 1.5, borderColor: colors.line, borderRadius: 15, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12, backgroundColor: colors.white },
    oauthButtonDark: { backgroundColor: colors.ink, borderColor: colors.ink },
    oauthIcon: { marginRight: 10 },
    oauthButtonBusy: { opacity: 0.6 },
    oauthButtonText: { color: colors.text, fontWeight: '700', fontSize: 15 },
    oauthButtonTextDark: { color: colors.white, fontWeight: '700', fontSize: 15 },
    link: { alignItems: 'center', marginTop: 22, padding: 5 },
    linkText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
    linkStrong: { color: colors.purple, fontWeight: '900' },
  });
}