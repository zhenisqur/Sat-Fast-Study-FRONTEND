import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleLogo } from '../../../components/uis/GoogleLogo';
import { Field } from '../../../components/ui';
import { useLanguage } from '../../../core/language-context';
import { useTheme } from '../../../core/theme-context';
import { AuthPayload } from '../../../core/types';
import { spacing, typeScale, radius } from '../../../core/design-tokens';
import { OnboardingAnswers } from '../types';
import { ChunkyOptionButton } from './ChunkyOptionButton';
import { MASCOT_HEIGHT } from './mascotLayout';

interface Props {
  answers: OnboardingAnswers;
  onAuthenticate: (mode: 'LOGIN' | 'REGISTER', payload: AuthPayload) => Promise<void>;
  onOAuthPress: (provider: 'GOOGLE' | 'APPLE') => Promise<void>;
  /** Регистрация прошла успешно — идём дальше по онбордингу. */
  onRegistered: () => void;
  /** «Уже есть аккаунт? Войти». */
  onLogin: () => void;
  /** Назад к последнему вопросу опроса. */
  onBack: () => void;
}

type View_ = 'options' | 'email';

const LOGO_SIZE = 64;

/** Плавное появление блока: лёгкий сдвиг по горизонтали + проявление. Запускается при монтировании (по key). */
function ViewTransition({ fromX, children }: { fromX: number; children: React.ReactNode }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [fromX, 0] });

  return (
    <Animated.View style={{ flex: 1, opacity: progress, transform: [{ translateX }] }}>
      {children}
    </Animated.View>
  );
}

export function SignUpStep({ answers, onAuthenticate, onOAuthPress, onRegistered, onLogin, onBack }: Props) {
  const { locale } = useLanguage();
  const { colors } = useTheme();
  const isRu = locale === 'ru';

  const [view, setView] = useState<View_>('options');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'GOOGLE' | 'APPLE' | 'EMAIL' | null>(null);

  const messageOf = (caught: unknown) =>
    caught instanceof Error ? caught.message : isRu ? 'Не получилось продолжить.' : 'Could not continue.';

  const handleOAuth = async (provider: 'GOOGLE' | 'APPLE') => {
    if (busy) return;
    setError('');
    setBusy(provider);
    let ok = false;
    try {
      await onOAuthPress(provider);
      ok = true;
    } catch (caught) {
      // Закрыл окно Google — просто остаёмся на экране, без ошибки и без перехода дальше.
      if (!(caught instanceof Error && caught.name === 'OAuthCancelled')) {
        setError(messageOf(caught));
      }
    } finally {
      setBusy(null);
    }
    if (ok) onRegistered();
  };

  const handleEmailSubmit = async () => {
    if (busy) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(isRu ? 'Введи корректную почту.' : 'Enter a valid email address.');
    if (password.length < 8) return setError(isRu ? 'Пароль — минимум 8 символов.' : 'Password must be at least 8 characters.');
    if (password !== confirmPassword) return setError(isRu ? 'Пароли не совпадают.' : "Passwords don't match.");
    if (!fullName.trim()) return setError(isRu ? 'Напиши, как тебя зовут.' : 'Tell us your name.');
    const ageNumber = Number(age);
    if (!Number.isInteger(ageNumber) || ageNumber < 1) return setError(isRu ? 'Введи возраст цифрами.' : 'Enter your age using digits only.');

    // Прошлый результат и «сдавал ли раньше» берём из ответов опроса — повторно не спрашиваем.
    const hasTakenSatBefore = answers.triedBefore === true;
    const payload: AuthPayload = { email, password };
    Object.assign(payload, { fullName: fullName.trim(), age: ageNumber, hasTakenSatBefore });
    if (hasTakenSatBefore && answers.previousScore != null) {
      payload.previousSatScore = Number(answers.previousScore);
    }

    setError('');
    setBusy('EMAIL');
    let ok = false;
    try {
      await onAuthenticate('REGISTER', payload);
      ok = true;
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setBusy(null);
    }
    if (ok) onRegistered();
  };

  const handleTopBack = () => {
    if (view === 'email') {
      setError('');
      setView('options');
    } else {
      onBack();
    }
  };

  const loginLink = (
    <Pressable onPress={onLogin} style={styles.link} accessibilityRole="button">
      <Text style={[styles.linkText, { color: colors.muted }]}>
        {isRu ? 'Уже есть аккаунт? ' : 'Already have an account? '}
        <Text style={[styles.linkStrong, { color: colors.mintDeep }]}>{isRu ? 'Войти' : 'Log in'}</Text>
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleTopBack}
        hitSlop={8}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel={isRu ? 'Назад' : 'Back'}
      >
        <Ionicons name="arrow-back" size={26} color={colors.muted} />
      </Pressable>

      {view === 'options' ? (
        <ViewTransition key="options" fromX={-28}>
          <View style={styles.mascotArea} pointerEvents="none">
            <Image
              source={require('../../../assets/mascot/slide tackle.png')}
              style={styles.mascot}
              resizeMode="cover"
              accessibilityRole="image"
              accessibilityLabel="Mascot"
            />
          </View>

          <View style={styles.optionsBody}>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
              {isRu ? 'Сохрани свой персональный план' : 'Save your personalized plan'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {isRu
                ? 'Войди, чтобы сохранить план обучения, баллы и прогресс'
                : 'Sign in to keep your study plan, scores, and progress synced'}
            </Text>

            <View style={styles.buttons}>
              <Pressable
                onPress={() => handleOAuth('GOOGLE')}
                disabled={busy !== null}
                style={[styles.providerBtn, { borderColor: colors.line, opacity: busy && busy !== 'GOOGLE' ? 0.5 : 1 }]}
                accessibilityRole="button"
              >
                <GoogleLogo size={20} />
                <Text style={[styles.providerText, { color: colors.text }]}>
                  {busy === 'GOOGLE' ? (isRu ? 'Секунду…' : 'One moment…') : isRu ? 'Продолжить с Google' : 'Continue with Google'}
                </Text>
              </Pressable>

              {Platform.OS === 'ios' ? (
                <Pressable
                  onPress={() => handleOAuth('APPLE')}
                  disabled={busy !== null}
                  style={[styles.providerBtn, { borderColor: colors.line, opacity: busy && busy !== 'APPLE' ? 0.5 : 1 }]}
                  accessibilityRole="button"
                >
                  <Ionicons name="logo-apple" size={22} color={colors.text} />
                  <Text style={[styles.providerText, { color: colors.text }]}>
                    {busy === 'APPLE' ? (isRu ? 'Секунду…' : 'One moment…') : isRu ? 'Продолжить с Apple' : 'Continue with Apple'}
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                onPress={() => {
                  setError('');
                  setView('email');
                }}
                disabled={busy !== null}
                style={[styles.providerBtn, { borderColor: colors.line }]}
                accessibilityRole="button"
              >
                <Ionicons name="mail" size={22} color={colors.text} />
                <Text style={[styles.providerText, { color: colors.text }]}>
                  {isRu ? 'Продолжить по почте' : 'Continue with email'}
                </Text>
              </Pressable>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {loginLink}
          </View>

        </ViewTransition>
      ) : (
        <ViewTransition key="email" fromX={28}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.emailBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="cover"
              accessibilityRole="image"
              accessibilityLabel="Sat Fast Study"
            />
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
              {isRu ? 'Создай аккаунт' : 'Create your account'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {isRu ? 'Несколько данных и твой план сохранён' : 'A few details and your plan is saved'}
            </Text>

            <Field label={isRu ? 'Имя' : 'Full name'} value={fullName} onChangeText={setFullName} autoCapitalize="words" />
            <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Field
              label={isRu ? 'Пароль' : 'Password'}
              hint={isRu ? 'Минимум 8 символов' : 'Minimum 8 characters'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Field
              label={isRu ? 'Повтори пароль' : 'Repeat password'}
              hint={
                confirmPassword.length > 0 && confirmPassword !== password
                  ? isRu ? 'Пароли не совпадают' : "Passwords don't match"
                  : undefined
              }
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <Field
              label={isRu ? 'Возраст' : 'Age'}
              value={age}
              onChangeText={(value) => setAge(value.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.submitWrap}>
              <ChunkyOptionButton
                label={busy === 'EMAIL' ? (isRu ? 'Секунду…' : 'One moment…') : isRu ? 'Создать аккаунт' : 'Create account'}
                variant="primary"
                onPress={handleEmailSubmit}
              />
            </View>

            {loginLink}
          </ScrollView>
        </KeyboardAvoidingView>
        </ViewTransition>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  backBtn: {
    alignSelf: 'flex-start',
    marginLeft: spacing.xxl,
    marginTop: spacing.md,
    padding: 4,
  },
  optionsBody: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    // низ контента не заезжает на маскота (верх картинки пустой, оставляем небольшой запас)
    paddingBottom: MASCOT_HEIGHT * 0.8,
    justifyContent: 'center',
  },
  emailBody: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  // логотип по центру, слегка скруглённый квадрат
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE * 0.28,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typeScale.title - 4,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typeScale.body - 1,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttons: { gap: spacing.sm },
  providerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
  },
  providerText: { fontSize: 16, fontWeight: '800' },
  error: {
    color: '#C53D51',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  submitWrap: { marginTop: spacing.md },
  link: { alignItems: 'center', marginTop: spacing.xl, padding: 5 },
  linkText: { fontSize: 14, fontWeight: '600' },
  linkStrong: { fontWeight: '900' },
  mascotArea: { position: 'absolute', left: 0, right: 0, bottom: 0, height: MASCOT_HEIGHT, overflow: 'hidden' },
  // маскот чуть спущен вниз: нижняя часть уходит за край экрана
  mascot: { width: '100%', height: '100%', transform: [{ translateY: MASCOT_HEIGHT * 0.07 }] },
});