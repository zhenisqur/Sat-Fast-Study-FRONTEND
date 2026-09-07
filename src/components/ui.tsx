import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../core/theme-context';
import { ThemeColors } from '../core/theme';

type ButtonTone = 'gold' | 'purple' | 'mint' | 'coral';

export function GameButton({ label, onPress, tone = 'gold', disabled = false }: { label: string; onPress: () => void; tone?: ButtonTone; disabled?: boolean }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const palette: Record<ButtonTone, [string, string, string]> = {
    gold: [colors.gold, colors.goldShadow, colors.ink],
    purple: [colors.purple, colors.purpleDeep, colors.white],
    mint: [colors.mint, colors.mintDeep, colors.ink],
    coral: [colors.coral, colors.coralDeep, colors.white],
  };
  const [backgroundColor, borderBottomColor, color] = palette[tone];
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderBottomColor, opacity: disabled ? 0.45 : 1, borderBottomWidth: pressed ? 2 : 5, transform: [{ translateY: pressed ? 3 : 0 }] },
      ]}
    >
      <Text style={[styles.buttonText, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, hint, ...props }: React.ComponentProps<typeof TextInput> & { label: string; hint?: string }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <TextInput style={styles.input} placeholderTextColor={colors.muted} {...props} />
    </View>
  );
}

export function ScreenHeader({ kicker, title, right }: { kicker?: string; title: string; right?: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function LoadState({ label }: { label: string }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.purple} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorTitle}>Couldn’t load this yet</Text>
      <Text style={styles.errorBody}>{message}</Text>
      <Pressable onPress={onRetry}>
        <Text style={styles.retry}>Try again</Text>
      </Pressable>
    </View>
  );
}

export function BackButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <Pressable onPress={onPress} style={styles.back}>
      <Text style={styles.backText}>‹</Text>
    </Pressable>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    button: { minHeight: 55, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 5, marginTop: 7 },
    buttonText: { fontSize: 16, fontWeight: '900' },
    field: { marginBottom: 16 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
    label: { color: colors.text, fontWeight: '800', fontSize: 14 },
    hint: { color: colors.muted, fontWeight: '600', fontSize: 12 },
    input: { height: 54, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line, borderRadius: 15, paddingHorizontal: 15, color: colors.text, fontWeight: '600', fontSize: 16 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 17 },
    kicker: { color: colors.purple, fontSize: 11, fontWeight: '900', letterSpacing: 1.25, marginBottom: 5 },
    title: { color: colors.text, fontWeight: '900', fontSize: 28, letterSpacing: -0.5 },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cloud },
    loadingText: { marginTop: 15, color: colors.muted, fontWeight: '700' },
    errorCard: { margin: 22, padding: 20, backgroundColor: '#FFF0F1', borderColor: '#FFC1CA', borderWidth: 1, borderRadius: 18 },
    errorTitle: { color: '#A13648', fontWeight: '900', fontSize: 17 },
    errorBody: { color: '#A13648', fontWeight: '600', lineHeight: 20, marginTop: 6 },
    retry: { color: colors.purple, fontWeight: '900', marginTop: 14 },
    back: { width: 36, height: 36, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1.4, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    backText: { color: colors.text, fontSize: 31, lineHeight: 31, marginTop: -3 },
  });
}