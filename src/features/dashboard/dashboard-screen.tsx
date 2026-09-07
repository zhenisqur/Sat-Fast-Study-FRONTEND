import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../../components/ui';
import { useTheme } from '../../core/theme-context';
import { ThemeColors } from '../../core/theme';
import { haptics } from '../../core/haptics';
import { DailyQuota, Progress, Section, User } from '../../core/types';

export function DashboardScreen({ user, progress, quota, onPractice }: { user: User; progress: Progress; quota: DailyQuota; onPractice: (section: Section) => void }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <ScreenHeader kicker="DAILY MISSION" title={`Hey, ${user.fullName.split(' ')[0]}!`} />
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Text style={{ fontSize: 31 }}>🎯</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroOverline}>YOUR JOURNEY</Text>
          <Text style={styles.heroTitle}>
            Level {progress.overall.level}
            <Text style={styles.heroTotal}> / {progress.overall.of}</Text>
          </Text>
          <Text style={styles.heroCopy}>Keep the momentum going today.</Text>
        </View>
      </View>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Today’s progress</Text>
        <Text style={styles.tag}>{quota.math + quota.readingWriting}/30 done</Text>
      </View>
      <Track colors={colors} title="Math" glyph="∑" color="#5D53BA" progress={progress.math} quota={quota.math} onPress={() => onPractice('MATH')} />
      <Track colors={colors} title="Reading & Writing" glyph="✎" color="#9A67D6" progress={progress.readingWriting} quota={quota.readingWriting} onPress={() => onPractice('READING_WRITING')} />
      <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Choose your practice</Text>
      <View style={styles.grid}>
        <PracticeTile colors={colors} glyph="∑" title="Practice Math" onPress={() => onPractice('MATH')} />
        <PracticeTile colors={colors} glyph="Aa" title="Practice R&W" onPress={() => onPractice('READING_WRITING')} />
      </View>
    </ScrollView>
  );
}

function Track({ colors, title, glyph, color, progress, quota, onPress }: { colors: ThemeColors; title: string; glyph: string; color: string; progress: { level: number; of: number }; quota: number; onPress: () => void }) {
  const styles = makeStyles(colors);
  const handlePress = () => {
    haptics.select();
    onPress();
  };
  return (
    <Pressable onPress={handlePress} style={styles.track}>
      <View style={[styles.trackIcon, { backgroundColor: color }]}>
        <Text style={styles.trackGlyph}>{glyph}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.trackTop}>
          <Text style={styles.trackTitle}>{title}</Text>
          <Text style={styles.level}>
            {progress.level}/{progress.of}
          </Text>
        </View>
        <View style={styles.rail}>
          <View style={[styles.fill, { width: `${(progress.level / progress.of) * 100}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.quota}>{quota}/15 completed today</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

function PracticeTile({ colors, glyph, title, onPress }: { colors: ThemeColors; glyph: string; title: string; onPress: () => void }) {
  const styles = makeStyles(colors);
  const handlePress = () => {
    haptics.tap();
    onPress();
  };
  return (
    <View style={styles.tile}>
      <View style={styles.tileIcon}>
        <Text style={styles.tileGlyph}>{glyph}</Text>
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileSub}>15 questions</Text>
      <Pressable onPress={handlePress} style={({ pressed }) => [styles.tileButton, pressed && styles.tileButtonPressed]}>
        <Text style={styles.tileButtonText}>Start</Text>
        <Text style={styles.tileButtonArrow}>→</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    scroll: { padding: 22, paddingTop: 31, paddingBottom: 28 },
    hero: { backgroundColor: colors.purple, borderRadius: 25, padding: 20, flexDirection: 'row', gap: 16 },
    heroIcon: { width: 61, height: 61, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#897DDD' },
    heroOverline: { color: colors.gold, fontWeight: '900', fontSize: 10, letterSpacing: 1.2 },
    heroTitle: { color: colors.white, fontSize: 29, fontWeight: '900', marginTop: 2 },
    heroTotal: { color: '#C9C3F3', fontSize: 17 },
    heroCopy: { color: '#E0DCFF', fontWeight: '600', marginTop: 3, fontSize: 13 },
    sectionRow: { marginTop: 27, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
    sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
    tag: { color: colors.purple, backgroundColor: colors.lavender, borderRadius: 9, paddingVertical: 4, paddingHorizontal: 7, fontWeight: '800', fontSize: 11 },
    track: { backgroundColor: colors.white, borderRadius: 18, marginBottom: 12, padding: 13, paddingRight: 11, flexDirection: 'row', alignItems: 'center', borderColor: colors.line, borderWidth: 1.2, gap: 12 },
    trackIcon: { height: 46, width: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    trackGlyph: { color: colors.white, fontSize: 22, fontWeight: '900' },
    trackTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
    trackTitle: { color: colors.text, fontWeight: '900', fontSize: 14 },
    level: { color: colors.purple, fontWeight: '900', fontSize: 13 },
    rail: { height: 8, borderRadius: 20, backgroundColor: colors.line, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 20 },
    quota: { color: colors.muted, fontWeight: '700', fontSize: 11, marginTop: 6 },
    arrow: { color: colors.muted, fontSize: 29 },
    grid: { flexDirection: 'row', gap: 12 },
    tile: { flex: 1, minHeight: 176, borderRadius: 20, padding: 15, backgroundColor: colors.white, borderWidth: 1.2, borderColor: colors.line, justifyContent: 'space-between' },
    tileIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
    tileGlyph: { color: colors.purple, fontSize: 19, fontWeight: '900' },
    tileTitle: { color: colors.text, fontWeight: '900', fontSize: 14 },
    tileSub: { color: colors.muted, fontSize: 12, fontWeight: '600', marginTop: 5 },
    tileButton: { marginTop: 14, backgroundColor: colors.purple, borderRadius: 13, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    tileButtonPressed: { opacity: 0.85, transform: [{ translateY: 1 }] },
    tileButtonText: { color: colors.white, fontWeight: '900', fontSize: 13 },
    tileButtonArrow: { color: colors.white, fontWeight: '900', fontSize: 14 },
  });
}