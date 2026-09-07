import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton, ScreenHeader } from '../../components/ui';
import { ThemeToggle } from '../../components/theme-toggle';
import { LanguageToggle } from '../../components/language-toggle';
import { DartIcon, CalendarIcon, ChartIcon, EnvelopeIcon } from '../../components/icons/profile-icons';
import { useTheme } from '../../core/theme-context';
import { useLanguage } from '../../core/language-context';
import { ThemeColors } from '../../core/theme';
import { User } from '../../core/types';

export function ProfileScreen({ user, onLogout, onRefresh }: { user: User; onLogout: () => void; onRefresh: () => void }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = makeStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <ScreenHeader kicker={t('profile.kicker')} title={t('profile.title')} />

      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.fullName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
        <Pressable onPress={onRefresh} style={styles.refresh}>
          <Text style={styles.refreshText}>↻</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>{t('profile.goals')}</Text>
      <View style={styles.card}>
        <Row colors={colors} Icon={DartIcon} label={t('profile.targetScore')} value={user.targetScore ? String(user.targetScore) : t('profile.notSet')} />
        <Row colors={colors} Icon={CalendarIcon} label={t('profile.age')} value={String(user.age)} />
        <Row
          colors={colors}
          Icon={ChartIcon}
          label={t('profile.previousSat')}
          value={user.hasTakenSatBefore && user.previousSatScore ? String(user.previousSatScore) : t('profile.firstAttempt')}
          last
        />
      </View>

      <Text style={styles.section}>{t('profile.account')}</Text>
      <View style={styles.card}>
        <Row colors={colors} Icon={EnvelopeIcon} label={t('profile.email')} value={user.email} last />
      </View>

      <ThemeToggle />

      <LanguageToggle />

      <View style={{ marginTop: 10 }}>
        <GameButton
          label={t('profile.logout')}
          tone="coral"
          onPress={() =>
            Alert.alert(t('profile.logoutConfirmTitle'), t('profile.logoutConfirmBody'), [
              { text: t('profile.cancel'), style: 'cancel' },
              { text: t('profile.logout'), style: 'destructive', onPress: onLogout },
            ])
          }
        />
      </View>
    </ScrollView>
  );
}

function Row({
  colors,
  Icon,
  label,
  value,
  last,
}: {
  colors: ThemeColors;
  Icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  last?: boolean;
}) {
  const styles = makeStyles(colors);
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <View style={styles.rowIcon}>
        <Icon size={38} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    scroll: { padding: 22, paddingTop: 31, paddingBottom: 28 },
    hero: { backgroundColor: colors.purple, borderRadius: 24, padding: 19, flexDirection: 'row', alignItems: 'center', gap: 13 },
    avatar: { width: 60, height: 60, borderRadius: 21, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: colors.ink, fontSize: 26, fontWeight: '900' },
    name: { color: colors.white, fontSize: 19, fontWeight: '900' },
    email: { color: '#DCD8FF', marginTop: 4, fontSize: 13, fontWeight: '600' },
    refresh: { height: 36, width: 36, borderRadius: 12, backgroundColor: '#8175D5', justifyContent: 'center', alignItems: 'center' },
    refreshText: { color: colors.white, fontWeight: '900', fontSize: 21 },
    section: { color: colors.purple, fontWeight: '900', letterSpacing: 1.2, fontSize: 11, marginTop: 25, marginBottom: 9 },
    card: { backgroundColor: colors.white, borderRadius: 18, borderWidth: 1.2, borderColor: colors.line, overflow: 'hidden' },
    row: { minHeight: 63, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
    rowIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lavender },
    rowLabel: { color: colors.text, fontWeight: '800', fontSize: 14, flex: 1 },
    rowValue: { color: colors.muted, fontWeight: '800', maxWidth: 138, fontSize: 13, textAlign: 'right' },
  });
}