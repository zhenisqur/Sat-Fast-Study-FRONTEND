import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, ThemePreference } from '../core/theme-context';
import { useLanguage } from '../core/language-context';
import { ThemeColors } from '../core/theme';

export function ThemeToggle() {
  const { colors, preference, setPreference } = useTheme();
  const { t } = useLanguage();
  const styles = makeStyles(colors);

  const options: { id: ThemePreference; label: string }[] = [
    { id: 'system', label: t('theme.auto') },
    { id: 'light', label: t('theme.light') },
    { id: 'dark', label: t('theme.dark') },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('profile.appearance')}</Text>
      <View style={styles.segment}>
        {options.map((option) => {
          const active = preference === option.id;
          return (
            <Pressable key={option.id} onPress={() => setPreference(option.id)} style={[styles.pill, active && styles.pillActive]}>
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: { backgroundColor: colors.white, borderRadius: 18, borderWidth: 1.5, borderColor: colors.line, padding: 16, marginBottom: 16 },
    label: { color: colors.text, fontWeight: '800', fontSize: 14, marginBottom: 12 },
    segment: { flexDirection: 'row', backgroundColor: colors.cloud, borderRadius: 13, padding: 4, gap: 4 },
    pill: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
    pillActive: { backgroundColor: colors.purple },
    pillText: { color: colors.muted, fontWeight: '800', fontSize: 13 },
    pillTextActive: { color: colors.white },
  });
}