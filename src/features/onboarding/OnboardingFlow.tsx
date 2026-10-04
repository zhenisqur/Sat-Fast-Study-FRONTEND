import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../core/language-context';
import { useTheme } from '../../core/theme-context';
import { ONBOARDING_STEPS } from './steps.config';
import { initialOnboardingAnswers, OnboardingAnswers, SingleChoiceStepConfig } from './types';
import { SingleChoiceStep } from './screens/SingleChoiceStep';
import { StudyDaysStep } from './screens/StudyDaysStep';
import { WelcomeStep } from './screens/WelcomeStep';
import { HookStep } from './screens/HookStep';
import { AnimatedStep } from './screens/AnimatedStep';
import { OnboardingProgressBar } from './OnboardingProgressBar';
import { MASCOT_HEIGHT } from './screens/mascotLayout';

interface Props {
  onComplete: (answers: OnboardingAnswers) => void;
}

type IntroStage = 'welcome' | 'hook' | 'done';

export function OnboardingFlow({ onComplete }: Props) {
  const [introStage, setIntroStage] = useState<IntroStage>('welcome');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialOnboardingAnswers);
  const { setLocale } = useLanguage();
  const { colors } = useTheme();

  const step = ONBOARDING_STEPS[stepIndex];

  const goNext = () => {
    if (stepIndex === ONBOARDING_STEPS.length - 1) {
      onComplete(answers);
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleSingleChoice = (field: SingleChoiceStepConfig['field'], rawValue: string) => {
    const value = rawValue === 'true' ? true : rawValue === 'false' ? false : rawValue;
    setAnswers((prev) => ({ ...prev, [field]: value }));

    if (field === 'language') {
      setLocale(rawValue as 'en' | 'ru');
    }

    goNext();
  };

  if (introStage === 'welcome') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cloud }} edges={['top', 'left', 'right']}>
        <AnimatedStep stepKey="welcome">
          <WelcomeStep onContinue={() => setIntroStage('hook')} />
        </AnimatedStep>
      </SafeAreaView>
    );
  }

  if (introStage === 'hook') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cloud }} edges={['top', 'left', 'right']}>
        <AnimatedStep stepKey="hook">
          <HookStep onContinue={() => setIntroStage('done')} />
        </AnimatedStep>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cloud }} edges={['top', 'left', 'right']}>
      <OnboardingProgressBar current={stepIndex} total={ONBOARDING_STEPS.length} />

      <AnimatedStep stepKey={`step-${stepIndex}`}>
        <View style={styles.content}>
          {step.type === 'single-choice' && (
            <SingleChoiceStep
              config={step}
              onAnswer={(value) => handleSingleChoice(step.field, value)}
            />
          )}

          {step.type === 'study-days' && (
            <StudyDaysStep
              value={answers.studyDays}
              intensity={answers.intensity}
              onConfirm={(days, intensity) => {
                setAnswers((prev) => ({ ...prev, studyDays: days, intensity }));
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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