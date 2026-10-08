import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useLanguage } from '../../../core/language-context';
import { useTheme } from '../../../core/theme-context';
import { spacing, typeScale } from '../../../core/design-tokens';
import { ChunkyOptionButton } from './ChunkyOptionButton';
import { SpeechBubble } from './SpeechBubble';
import { MASCOT_HEIGHT } from './mascotLayout';

interface Props {
  onContinue: () => void;
}

export function RegisterPromptStep({ onContinue }: Props) {
  const { locale } = useLanguage();
  const { colors } = useTheme();
  const isRu = locale === 'ru';

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />

      <View style={styles.bubbleWrap}>
        <SpeechBubble>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
            {isRu ? 'Давай зарегаемся?)' : "Let's get you registered?)"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {isRu
              ? 'Сохраним твои ответы и соберём план подготовки именно под тебя.'
              : "We'll save your answers and put together a plan made for you."}
          </Text>
        </SpeechBubble>
      </View>

      <View style={styles.mascotArea}>
        <Image
          source={require('../../../assets/mascot/slide tackle.png')}
          style={styles.mascot}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel="Mascot"
        />
      </View>

      <View style={styles.cta}>
        <ChunkyOptionButton
          label={isRu ? 'Зарегистрироваться' : 'Sign up'}
          variant="primary"
          onPress={onContinue}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  spacer: { flex: 1 },
  bubbleWrap: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.lg },
  title: { fontSize: typeScale.title, fontWeight: '800', marginBottom: spacing.sm },
  subtitle: { fontSize: typeScale.body, fontWeight: '500', lineHeight: typeScale.body * 1.4 },
  mascotArea: {
    width: '100%',
    height: MASCOT_HEIGHT,
  },
  mascot: {
    width: '100%',
    height: '100%',
  },
  cta: {
    position: 'absolute',
    left: spacing.xxl,
    right: spacing.xxl,
    bottom: spacing.xxxl,
  },
});