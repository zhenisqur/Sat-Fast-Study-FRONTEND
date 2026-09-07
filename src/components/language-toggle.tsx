import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../core/theme-context';
import { useLanguage } from '../core/language-context';
import { Locale } from '../core/i18n/locales';
import { ThemeColors } from '../core/theme';

const OPTIONS: { id: Locale; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'ru', label: 'RU' },
  { id: 'kk', label: 'KZ' },
];

export function LanguageToggle() {
  const { colors } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const styles = makeStyles(colors);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('profile.language')}</Text>
      <View style={styles.segment}>
        {OPTIONS.map((option) => {
          const active = locale === option.id;
          return (
            <Pressable key={option.id} onPress={() => setLocale(option.id)} style={[styles.pill, active && styles.pillActive]}>
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