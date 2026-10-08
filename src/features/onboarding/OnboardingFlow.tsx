import React, { useState } from 'react';
import { View, Image, StyleSheet, Keyboard, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../core/language-context';
import { useTheme } from '../../core/theme-context';
import { ONBOARDING_STEPS } from './steps.config';
import { initialOnboardingAnswers, OnboardingAnswers, SingleChoiceStepConfig } from './types';
import { SingleChoiceStep } from './screens/SingleChoiceStep';
import { ExamDateQuestionStep } from './screens/ExamDateQuestionStep';
import { StudyDaysStep } from './screens/StudyDaysStep';
import { StudyIntensityStep } from './screens/StudyIntensityStep';
import { ScoreStep } from './screens/ScoreStep';
import { WelcomeStep } from './screens/WelcomeStep';
import { HookStep } from './screens/HookStep';
import { SignUpStep } from './screens/SignUpStep';
import { PlanLoadingStep } from './screens/PlanLoadingStep';
import { PlanPaywallStep } from './screens/PlanPaywallStep';
import { AnimatedStep } from './screens/AnimatedStep';
import { OnboardingProgressBar } from './OnboardingProgressBar';
import { AuthScreen } from '../auth/auth-screen';
import { AuthPayload } from '../../core/types';
import { MASCOT_HEIGHT } from './screens/mascotLayout';

interface Props {
  onComplete: (answers: OnboardingAnswers) => void;
  onAuthenticate: (mode: 'LOGIN' | 'REGISTER', payload: AuthPayload) => Promise<void>;
  onOAuthPress: (provider: 'GOOGLE' | 'APPLE') => Promise<void>;
}

// Фон внутри PNG маскота (rgb 22,18,35) чуть светлее фона приложения (rgb 20,16,33).
// Красим экран вопросов в цвет картинки, чтобы не было шва на границе маскота.
const MASCOT_BG = '#161223';

type IntroStage = 'welcome' | 'hook' | 'done' | 'register' | 'login' | 'planLoading' | 'planPaywall';

export function OnboardingFlow({ onComplete, onAuthenticate, onOAuthPress }: Props) {
  const [introStage, setIntroStage] = useState<IntroStage>('welcome');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialOnboardingAnswers);
  const { setLocale } = useLanguage();
  const { colors } = useTheme();

  // Прошлый результат спрашиваем только у тех, кто уже сдавал. Желаемый — у всех.
  const visibleSteps = ONBOARDING_STEPS.filter(
    (s) => s.id !== 'score-previous' || answers.triedBefore === true
  );
  const step = visibleSteps[stepIndex];

  const goNext = () => {
    if (stepIndex === visibleSteps.length - 1) {
      setIntroStage('register');
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const goBack = () => {
    if (stepIndex === 0) {
      setIntroStage('hook');
    } else {
      setStepIndex((i) => i - 1);
    }
  };

  const handleSingleChoice = (field: SingleChoiceStepConfig['field'], rawValue: string) => {
    const value = rawValue === 'true' ? true : rawValue === 'false' ? false : rawValue;
    setAnswers((prev) => {
      const next = { ...prev, [field]: value };
      // Если человек вернулся и сменил ответ на «не сдавал» — прошлые баллы сбрасываем.
      if (field === 'triedBefore' && value === false) {
        next.previousMath = null;
        next.previousReading = null;
        next.previousScore = null;
      }
      return next;
    });

    if (field === 'language') {
      setLocale(rawValue as 'en' | 'ru');
    }

    goNext();
  };

  if (introStage === 'welcome') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: MASCOT_BG }} edges={['top', 'left', 'right']}>
        <AnimatedStep stepKey="welcome">
          <WelcomeStep onContinue={() => setIntroStage('hook')} />
        </AnimatedStep>
      </SafeAreaView>
    );
  }

  if (introStage === 'hook') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: MASCOT_BG }} edges={['top', 'left', 'right']}>
        <AnimatedStep stepKey="hook">
          <HookStep onContinue={() => setIntroStage('done')} />
        </AnimatedStep>
      </SafeAreaView>
    );
  }

  if (introStage === 'register') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cloud }} edges={['top', 'left', 'right']}>
        <AnimatedStep stepKey="register">
          <SignUpStep
            answers={answers}
            onAuthenticate={onAuthenticate}
            onOAuthPress={onOAuthPress}
            onRegistered={() => setIntroStage('planLoading')}
            onLogin={() => setIntroStage('login')}
            onBack={() => setIntroStage('done')}
          />
        </AnimatedStep>
      </SafeAreaView>
    );
  }

  // Уже есть аккаунт: входим и сразу выходим из онбординга — план и данные подтянутся с сервера.
  if (introStage === 'login') {
    return (
      <AuthScreen
        onAuthenticate={async (mode, payload) => {
          await onAuthenticate(mode, payload);
          onComplete(answers);
        }}
        onOAuthPress={async (provider) => {
          await onOAuthPress(provider);
          onComplete(answers);
        }}
      />
    );
  }

  if (introStage === 'planLoading') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cloud }} edges={['top', 'left', 'right']}>
        <AnimatedStep stepKey="planLoading">
          <PlanLoadingStep onContinue={() => setIntroStage('planPaywall')} />
        </AnimatedStep>
      </SafeAreaView>
    );
  }

  if (introStage === 'planPaywall') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cloud }}>
        <AnimatedStep stepKey="planPaywall">
          <PlanPaywallStep
            answers={answers}
            onContinue={() => onComplete(answers)}
            onClose={() => onComplete(answers)}
          />
        </AnimatedStep>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MASCOT_BG }} edges={['top', 'left', 'right']}>
      <Pressable style={styles.screen} onPress={Keyboard.dismiss} accessible={false}>
        <OnboardingProgressBar current={stepIndex} total={visibleSteps.length} onBack={goBack} />

        <AnimatedStep stepKey={`step-${step.id}`}>
          <View style={styles.content}>
            {step.type === 'single-choice' && (
              <SingleChoiceStep
                config={step}
                onAnswer={(value) => handleSingleChoice(step.field, value)}
              />
            )}

            {step.type === 'exam-date' && (
              <ExamDateQuestionStep
                onConfirm={(examDate) => {
                  setAnswers((prev) => ({ ...prev, examDate }));
                  goNext();
                }}
              />
            )}

            {step.type === 'study-days' && (
              <StudyDaysStep
                value={answers.studyDays}
                onConfirm={(days) => {
                  setAnswers((prev) => ({ ...prev, studyDays: days }));
                  goNext();
                }}
              />
            )}

            {step.type === 'study-intensity' && (
              <StudyIntensityStep
                onConfirm={(intensity) => {
                  setAnswers((prev) => ({ ...prev, intensity }));
                  goNext();
                }}
              />
            )}

            {step.type === 'score' && (
              <ScoreStep
                key={step.id}
                mode={step.mode}
                minTotal={step.mode === 'target' ? answers.previousScore : null}
                onConfirm={(math, reading) => {
                  setAnswers((prev) =>
                    step.mode === 'previous'
                      ? { ...prev, previousMath: math, previousReading: reading, previousScore: math + reading }
                      : { ...prev, targetMath: math, targetReading: reading, targetScore: math + reading }
                  );
                  goNext();
                }}
              />
            )}
          </View>
        </AnimatedStep>

        <View style={styles.mascotWrap} pointerEvents="none">
          <Image
            source={require('../../assets/mascot/explain.png')}
            style={styles.mascot}
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel="Mascot"
          />
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: MASCOT_HEIGHT,
  },
  mascotWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MASCOT_HEIGHT,
    overflow: 'hidden',
  },
  mascot: {
    width: '100%',
    height: '100%',
  },
});