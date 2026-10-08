import React, { useMemo, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../../core/language-context';
import { useTheme } from '../../../core/theme-context';
import { spacing, typeScale, radius } from '../../../core/design-tokens';
import { OnboardingAnswers } from '../types';
import { FixedBottomMascot, MASCOT_SOURCE, MASCOT_ZONE_HEIGHT } from './FixedBottomMascot';

interface Props {
  answers: OnboardingAnswers;
  onContinue: () => void;
  onClose: () => void;
}

type PlanKey = 'month' | 'quarter' | 'year';

const PLANS: {
  key: PlanKey;
  priceTg: number;
  months: number; // на сколько месяцев доступ (для даты «до ...»)
  days: number; // для расчёта цены в день
  labelRu: string;
  labelEn: string;
}[] = [
  { key: 'month', priceTg: 6990, months: 1, days: 30, labelRu: '1 месяц', labelEn: '1 month' },
  { key: 'quarter', priceTg: 11990, months: 3, days: 90, labelRu: '3 месяца', labelEn: '3 months' },
  { key: 'year', priceTg: 15990, months: 12, days: 365, labelRu: '1 год', labelEn: '1 year' },
];

const FEATURES: { ru: string; en: string }[] = [
  { ru: 'Все темы по математике и грамматике', en: 'Every Math and Grammar topic' },
  { ru: 'Тренировка по отдельным типам задач', en: 'Practice by individual question type' },
  { ru: 'Работа над ошибками разбор каждого промаха', en: 'Mistake review — every error explained' },
  { ru: 'Прогресс и статистика по каждой теме', en: 'Progress and stats for every topic' },
  { ru: 'Короткие ежедневные тренировки под твой темп', en: 'Short daily workouts at your own pace' },
];

const SCREEN_HEIGHT = Dimensions.get('window').height;
const LOGO_SIZE = 40;
const PRO_COL_WIDTH = 84;

export function PlanPaywallStep({ answers, onContinue, onClose }: Props) {
  const { locale } = useLanguage();
  const { colors } = useTheme();
  const isRu = locale === 'ru';
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('month');
  const [showAllPlans, setShowAllPlans] = useState(false);

  const hasScores = answers.previousScore != null && answers.targetScore != null;

  const examInfo = useMemo(() => {
    if (!answers.examDate) return null;
    const target = new Date(answers.examDate);
    const today = new Date();
    const diffDays = Math.max(0, Math.round((target.getTime() - today.getTime()) / 86400000));
    return {
      diffDays,
      formatted: target.toLocaleDateString(isRu ? 'ru-RU' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
  }, [answers.examDate, isRu]);

  // Дата окончания доступа с названием месяца: сегодня + N месяцев.
  const formatAccessUntil = (months: number, ru: boolean) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString(ru ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Свёрнуто — только выбранный тариф; «Все тарифы» раскрывает остальные.
  const visiblePlans = showAllPlans ? PLANS : PLANS.filter((p) => p.key === selectedPlan);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.cloud }]} edges={['top', 'left', 'right']}>
      {/* --- шапка: круглый логотип + название + закрыть --- */}
      <View style={[styles.header, { backgroundColor: colors.cloud }]}>
        <View style={styles.brand}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="cover" />
          <Text style={[styles.brandText, { color: colors.text }]}>Sat Fast Study</Text>
        </View>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel={isRu ? 'Закрыть' : 'Close'}
        >
          <Text style={[styles.close, { color: colors.muted }]}>✕</Text>
        </Pressable>
      </View>

      {/* --- скроллится ТОЛЬКО это, flex:1 ограничен сверху и снизу соседями --- */}
      <View style={styles.scrollWrap}>
        <ScrollView
          style={[styles.scroll, { backgroundColor: colors.cloud }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
            {isRu ? 'Твой план готов' : 'Your plan is ready'}
          </Text>

          {hasScores ? (
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreNum, { color: colors.muted }]}>{answers.previousScore}</Text>
              <Text style={[styles.scoreArrow, { color: colors.mintDeep }]}>→</Text>
              <Text style={[styles.scoreNum, { color: colors.mintDeep }]}>{answers.targetScore}</Text>
            </View>
          ) : answers.targetScore != null ? (
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreArrow, { color: colors.muted }]}>{isRu ? 'Цель' : 'Goal'}</Text>
              <Text style={[styles.scoreNum, { color: colors.mintDeep }]}>{answers.targetScore}</Text>
            </View>
          ) : (
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {isRu
                ? 'Начнём с нуля и построим твой путь к высокому баллу'
                : "We'll start from scratch and build your path to a high score"}
            </Text>
          )}

          {examInfo ? (
            <View style={styles.dateInfo}>
              <Text style={[styles.dateHint, { color: colors.muted }]}>
                {isRu
                  ? `${examInfo.diffDays} дней до экзамена · ${examInfo.formatted}`
                  : `${examInfo.diffDays} days until your exam · ${examInfo.formatted}`}
              </Text>
              <Text style={[styles.dateHint, { color: colors.muted }]}>
                {isRu ? 'План подстраивается по мере твоего прогресса.' : 'Your plan adapts as you improve.'}
              </Text>
            </View>
          ) : null}

          {/* --- таблица: только колонка Pro, подсвеченная --- */}
          <View style={styles.table}>
            <View
              pointerEvents="none"
              style={[styles.proBackdrop, { backgroundColor: colors.mint, width: PRO_COL_WIDTH }]}
            />
            <View style={styles.tableHeaderRow}>
              <View style={styles.proCell}>
                <Text style={[styles.proLabel, { color: colors.mintDeep }]}>Pro</Text>
              </View>
            </View>
            {FEATURES.map((f, idx) => (
              <View
                key={f.ru}
                style={[
                  styles.featureRow,
                  idx !== FEATURES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.line },
                ]}
              >
                <Text style={[styles.featureText, { color: colors.text }]}>{isRu ? f.ru : f.en}</Text>
                <View style={styles.proCell}>
                  <View style={[styles.checkBadge, { backgroundColor: colors.mint }]}>
                    <Text style={[styles.checkMark, { color: colors.ink }]}>✓</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* плавное затухание списка перед маскотом вместо резкого обрыва */}
        <LinearGradient
          colors={['transparent', colors.cloud]}
          pointerEvents="none"
          style={styles.fade}
        />
      </View>

      <View style={styles.plansWrap}>
        {/* --- тариф закреплён снизу и не уезжает со скроллом (как в OnePrep) --- */}
        <ScrollView
          style={styles.plansScroll}
          contentContainerStyle={styles.plans}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {visiblePlans.map((plan) => {
            const selected = plan.key === selectedPlan;
            return (
              <Pressable
                key={plan.key}
                onPress={() => setSelectedPlan(plan.key)}
                style={[
                  styles.planCard,
                  { borderColor: selected ? colors.mintDeep : colors.line, borderWidth: selected ? 3 : 2 },
                ]}
              >
                <View style={[styles.radio, { borderColor: selected ? colors.mintDeep : colors.line }]}>
                  {selected ? <View style={[styles.radioDot, { backgroundColor: colors.mintDeep }]} /> : null}
                </View>
                <View style={styles.planInfo}>
                  <Text style={[styles.planLabel, { color: colors.text }]}>
                    {isRu ? plan.labelRu : plan.labelEn}
                  </Text>
                  <Text style={[styles.planSub, { color: colors.muted }]}>
                    {isRu
                      ? `Доступ до ${formatAccessUntil(plan.months, true)}`
                      : `Full access through ${formatAccessUntil(plan.months, false)}`}
                  </Text>
                  <Text style={[styles.planSub, { color: colors.mintDeep }]}>
                    {isRu
                      ? `≈${Math.round(plan.priceTg / plan.days)} ₸ в день`
                      : `≈${Math.round(plan.priceTg / plan.days)} ₸ per day`}
                  </Text>
                </View>
                <Text style={[styles.planPrice, { color: colors.text }]}>
                  {plan.priceTg.toLocaleString('ru-RU')} ₸
                </Text>
              </Pressable>
            );
          })}

          {!showAllPlans && (
            <Pressable onPress={() => setShowAllPlans(true)} style={styles.otherPlansRow}>
              <Text style={[styles.otherPlansText, { color: colors.text }]}>
                {isRu ? 'Все тарифы' : 'View all plans'}
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>

      {/* --- нижняя зона: обычный flex-сосед, НЕ absolute, фиксированной высоты --- */}
      <View style={[styles.bottomZone, { backgroundColor: colors.cloud }]}>
        <FixedBottomMascot source={MASCOT_SOURCE} />
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Pressable
            onPress={onContinue}
            style={[styles.cta, { backgroundColor: colors.mint, borderColor: colors.mintDeep }]}
            accessibilityRole="button"
          >
            <Text style={[styles.ctaText, { color: colors.ink }]}>{isRu ? 'Продолжить' : 'Continue'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  closeBtn: { position: 'absolute', right: spacing.xxl, top: spacing.md + (LOGO_SIZE - 22) / 2 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE * 0.28, // слегка скруглённый квадрат
    overflow: 'hidden',
  },
  brandText: { fontSize: typeScale.subhead, fontWeight: '800' },
  close: { fontSize: 22, fontWeight: '700' },
  scrollWrap: { flex: 1 },
  scroll: { flex: 1 },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  title: { fontSize: typeScale.title, fontWeight: '800', textAlign: 'center', marginBottom: spacing.md },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  scoreNum: { fontSize: typeScale.title + 10, fontWeight: '900' },
  scoreArrow: { fontSize: typeScale.title, fontWeight: '700' },
  subtitle: { fontSize: typeScale.body, fontWeight: '500', textAlign: 'center', marginBottom: spacing.xl },
  dateInfo: { alignItems: 'center', marginBottom: spacing.xl },
  dateHint: { fontSize: typeScale.footnote, fontWeight: '600', textAlign: 'center', marginTop: spacing.xs },

  // --- таблица с одной колонкой Pro ---
  table: { width: '100%', marginBottom: spacing.xxl },
  proBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    opacity: 0.16,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  tableHeaderRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingVertical: spacing.sm },
  proCell: { width: PRO_COL_WIDTH, alignItems: 'center', justifyContent: 'center' },
  proLabel: { fontSize: typeScale.body, fontWeight: '800' },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  featureText: { flex: 1, fontSize: typeScale.body, fontWeight: '600', paddingRight: spacing.md },
  checkBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkMark: { fontSize: 14, fontWeight: '800' },

  // --- тарифы ---
  plansWrap: { paddingHorizontal: spacing.xxl, maxHeight: SCREEN_HEIGHT * 0.42 },
  plansScroll: { flexGrow: 0 },
  plans: { width: '100%', gap: spacing.sm },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  planInfo: { flex: 1 },
  planLabel: { fontSize: typeScale.subhead, fontWeight: '800' },
  planSub: { fontSize: typeScale.footnote, fontWeight: '600', marginTop: 2 },
  planPrice: { fontSize: typeScale.subhead, fontWeight: '800' },
  otherPlansRow: { alignItems: 'center', paddingVertical: spacing.md },
  otherPlansText: { fontSize: typeScale.subhead, fontWeight: '800', textDecorationLine: 'underline' },

  // --- фиксированная нижняя зона: обычный блок в потоке, не absolute ---
  bottomZone: {
    height: MASCOT_ZONE_HEIGHT,
    justifyContent: 'flex-end',
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  cta: { borderWidth: 2, borderRadius: radius.xl, paddingVertical: spacing.lg, alignItems: 'center' },
  ctaText: { fontSize: typeScale.subhead, fontWeight: '800' },
});