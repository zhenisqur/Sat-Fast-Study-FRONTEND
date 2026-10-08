import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../../../core/language-context';
import { useTheme } from '../../../core/theme-context';
import { spacing, typeScale, radius } from '../../../core/design-tokens';
import { ChunkyOptionButton } from './ChunkyOptionButton';

interface Props {
  value: string[];
  onConfirm: (days: string[]) => void;
}

const DAYS: { key: string; labelRu: string; labelEn: string }[] = [
  { key: 'mon', labelRu: 'Пн', labelEn: 'Mon' },
  { key: 'tue', labelRu: 'Вт', labelEn: 'Tue' },
  { key: 'wed', labelRu: 'Ср', labelEn: 'Wed' },
  { key: 'thu', labelRu: 'Чт', labelEn: 'Thu' },
  { key: 'fri', labelRu: 'Пт', labelEn: 'Fri' },
  { key: 'sat', labelRu: 'Сб', labelEn: 'Sat' },
  { key: 'sun', labelRu: 'Вс', labelEn: 'Sun' },

];

export function StudyDaysStep({ value, onConfirm }: Props) {
  const { locale } = useLanguage();
  const { colors } = useTheme();
  const isRu = locale === 'ru';

  const [selectedDays, setSelectedDays] = useState<string[]>(value ?? []);

  const toggleDay = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedDays((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={[styles.question, { color: colors.text }]}>
        {isRu ? 'В какие дни будешь заниматься?' : 'Which days will you study?'}
      </Text>

      <View style={styles.daysRow}>
        {DAYS.map((day) => {
          const selected = selectedDays.includes(day.key);
          return (
            <Pressable
              key={day.key}
              onPress={() => toggleDay(day.key)}
              hitSlop={6}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={isRu ? day.labelRu : day.labelEn}
              style={[
                styles.dayChip,
                {
                  backgroundColor: selected ? colors.mint : colors.white,
                  borderColor: selected ? colors.mintDeep : colors.line,
                },
              ]}
            >
              <Text style={[styles.dayLabel, { color: selected ? colors.ink : colors.text }]}>
                {isRu ? day.labelRu : day.labelEn}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {selectedDays.length > 0 && (
        <View style={styles.cta}>
          <ChunkyOptionButton
            label={isRu ? 'Далее' : 'Next'}
            variant="primary"
            onPress={() => onConfirm(selectedDays)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
  question: {
    fontSize: typeScale.title,
    fontWeight: '800',
    lineHeight: typeScale.title * 1.3,
    marginBottom: spacing.xxl,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayChip: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: { fontSize: typeScale.footnote, fontWeight: '700' },
  cta: { marginTop: spacing.xxl },
});