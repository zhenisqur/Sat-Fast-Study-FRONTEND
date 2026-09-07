import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackButton, GameButton } from '../../components/ui';
import { useTheme } from '../../core/theme-context';
import { useLanguage } from '../../core/language-context';
import { ThemeColors, sectionLabel } from '../../core/theme';
import { haptics } from '../../core/haptics';
import { Api } from '../../services/api';
import { DailyQuota, Progress, Question, Section } from '../../core/types';

export function PracticeLanding({ progress, quota, onStart }: { progress: Progress; quota: DailyQuota; onStart: (section: Section) => void }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = makeStyles(colors, 'light');
  return (
    <ScrollView contentContainerStyle={styles.landing}>
      <Text style={styles.eyebrow}>{t('practice.eyebrow')}</Text>
      <Text style={styles.landingTitle}>{t('practice.title')}</Text>
      <Text style={styles.landingLead}>{t('practice.lead')}</Text>
      <SprintCard
        colors={colors}
        eyebrow={t('practice.mathEyebrow')}
        glyph="∑"
        title={t('practice.mathSprint')}
        meta={t('practice.levelMeta', { level: progress.math.level, done: quota.math })}
        button={t('practice.startMath')}
        onPress={() => onStart('MATH')}
      />
      <SprintCard
        colors={colors}
        eyebrow={t('practice.rwEyebrow')}
        glyph="✎"
        title={t('practice.rwSprint')}
        meta={t('practice.levelMeta', { level: progress.readingWriting.level, done: quota.readingWriting })}
        button={t('practice.startRW')}
        alternate
        onPress={() => onStart('READING_WRITING')}
      />
    </ScrollView>
  );
}

function SprintCard({
  colors,
  eyebrow,
  glyph,
  title,
  meta,
  button,
  alternate,
  onPress,
}: {
  colors: ThemeColors;
  eyebrow: string;
  glyph: string;
  title: string;
  meta: string;
  button: string;
  alternate?: boolean;
  onPress: () => void;
}) {
  const styles = makeStyles(colors, 'light');
  return (
    <View style={[styles.sprint, alternate && styles.sprintAlt]}>
      <Text style={[styles.sprintEyebrow, alternate && { color: colors.purple }]}>{eyebrow}</Text>
      <Text style={styles.sprintGlyph}>{glyph}</Text>
      <Text style={styles.sprintTitle}>{title}</Text>
      <Text style={styles.sprintMeta}>{meta}</Text>
      <GameButton label={button} tone={alternate ? 'purple' : 'gold'} onPress={onPress} />
    </View>
  );
}

export function PracticeSession({
  api,
  section,
  quota,
  onQuotaChange,
  onClose,
}: {
  api: Api;
  section: Section;
  quota: DailyQuota;
  onQuotaChange: (value: DailyQuota) => void;
  onClose: (leveledUp: boolean) => void;
}) {
  const { colors, scheme } = useTheme();
  const { t } = useLanguage();
  const styles = makeStyles(colors, scheme);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<'CORRECT' | 'INCORRECT' | null>(null);
  const [explanation, setExplanation] = useState(false);
  const [complete, setComplete] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const startedAt = useRef(Date.now());
  const flash = useRef(new Animated.Value(0)).current;

  const load = useCallback(() => {
    setError('');
    setQuestions(null);
    api
      .getQuestions(section)
      .then(setQuestions)
      .catch((caught) => setError(caught instanceof Error ? caught.message : t('practice.errorLoad')));
  }, [api, section, t]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    startedAt.current = Date.now();
  }, [index]);

  if (error) return <LoadError colors={colors} t={t} message={error} onBack={() => onClose(false)} onRetry={load} />;
  if (!questions)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.purple} size="large" />
        <Text style={styles.loadingText}>{t('practice.loadingQuestions')}</Text>
      </View>
    );
  if (!questions.length) return <EmptyLevel colors={colors} t={t} section={section} onBack={() => onClose(false)} />;
  if (complete) return <Complete colors={colors} t={t} section={section} levelUp={leveledUp} onDone={() => onClose(leveledUp)} />;

  const question = questions[index];
  const successBg = scheme === 'dark' ? '#123924' : '#E2FFF1';
  const errorBg = scheme === 'dark' ? '#3A1620' : '#FFE8EB';

  const submit = async () => {
    if (!selected || result) return;
    try {
      const response = await api.submitAnswer(section, question.id, selected, Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)));
      setResult(response.correctness);
      setLeveledUp(Boolean(response.leveledUp));
      if (response.correctness === 'CORRECT') {
        haptics.success();
        onQuotaChange({ ...quota, [section === 'MATH' ? 'math' : 'readingWriting']: Math.min(15, quota[section === 'MATH' ? 'math' : 'readingWriting'] + 1) });
      } else {
        haptics.error();
      }
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 150, useNativeDriver: false }),
        Animated.spring(flash, { toValue: 0, friction: 4, useNativeDriver: false }),
      ]).start();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('practice.errorSubmit'));
    }
  };
  const next = () => {
    haptics.tap();
    if (index === questions.length - 1) return setComplete(true);
    setIndex((value) => value + 1);
    setSelected(null);
    setResult(null);
    setExplanation(false);
  };
  const cardStyle = {
    backgroundColor: flash.interpolate({ inputRange: [0, 1], outputRange: [colors.white, result === 'CORRECT' ? successBg : errorBg] }),
    borderColor: flash.interpolate({ inputRange: [0, 1], outputRange: [colors.line, result === 'CORRECT' ? colors.mint : colors.coral] }),
  };

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <BackButton onPress={() => onClose(false)} />
        <View style={styles.progressRail}>
          <View style={[styles.progressFill, { width: `${((index + (result ? 1 : 0)) / questions.length) * 100}%` }]} />
        </View>
        <Text style={styles.count}>
          {index + 1}/{questions.length}
        </Text>
      </View>
      <Text style={styles.section}>{sectionLabel(section).toUpperCase()}</Text>
      <ScrollView contentContainerStyle={styles.questionScroll}>
        <Animated.View style={[styles.questionCard, cardStyle]}>
          <Text style={styles.stem}>{question.stem}</Text>
        </Animated.View>
        <View style={styles.choices}>
          {question.choices.map((choice) => (
            <Choice
              key={choice.id}
              colors={colors}
              scheme={scheme}
              choice={choice}
              selected={selected === choice.id}
              result={selected === choice.id ? result : null}
              onPress={() => setSelected(choice.id)}
              disabled={Boolean(result)}
            />
          ))}
        </View>
        {result === 'INCORRECT' && question.explanation ? (
          <>
            <Pressable onPress={() => { haptics.tap(); setExplanation(!explanation); }} style={styles.explanationToggle}>
              <Text style={styles.explanationButton}>{explanation ? t('practice.hideExplanation') : t('practice.showExplanation')}</Text>
              <Text style={styles.explanationButton}>{explanation ? '⌃' : '⌄'}</Text>
            </Pressable>
            {explanation ? (
              <View style={styles.explanation}>
                <Text style={styles.explanationLabel}>{t('practice.why')}</Text>
                <Text style={styles.explanationText}>{question.explanation}</Text>
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
      <View style={styles.dock}>
        {result ? (
          <View style={styles.feedback}>
            <Text style={[styles.feedbackTitle, { color: result === 'CORRECT' ? colors.mintDeep : colors.coralDeep }]}>
              {result === 'CORRECT' ? t('practice.niceWork') : t('practice.notQuite')}
            </Text>
            <Text style={styles.feedbackSub}>{result === 'CORRECT' ? t('practice.rightAnswer') : t('practice.checkExplanation')}</Text>
          </View>
        ) : null}
        <GameButton
          label={result ? t('practice.nextQuestion') : t('practice.checkAnswer')}
          onPress={result ? next : submit}
          disabled={!selected}
          tone={result === 'CORRECT' ? 'mint' : result === 'INCORRECT' ? 'coral' : 'gold'}
        />
      </View>
    </View>
  );
}

function Choice({
  colors,
  scheme,
  choice,
  selected,
  result,
  onPress,
  disabled,
}: {
  colors: ThemeColors;
  scheme: 'light' | 'dark';
  choice: { id: string; text: string };
  selected: boolean;
  result: 'CORRECT' | 'INCORRECT' | null;
  onPress: () => void;
  disabled: boolean;
}) {
  const styles = makeStyles(colors, scheme);
  const outcome = result === 'CORRECT' ? styles.choiceCorrect : result === 'INCORRECT' ? styles.choiceIncorrect : undefined;
  const handlePress = () => {
    haptics.select();
    onPress();
  };
  return (
    <Pressable onPress={handlePress} disabled={disabled} style={[styles.choice, selected && styles.choiceActive, outcome]}>
      <View style={[styles.letter, selected && styles.letterActive, result === 'CORRECT' && styles.letterCorrect, result === 'INCORRECT' && styles.letterIncorrect]}>
        <Text style={[styles.letterText, selected && { color: '#FFFFFF' }]}>{choice.id}</Text>
      </View>
      <Text style={styles.choiceText}>{choice.text}</Text>
    </Pressable>
  );
}

function LoadError({ colors, t, message, onBack, onRetry }: { colors: ThemeColors; t: (k: string) => string; message: string; onBack: () => void; onRetry: () => void }) {
  const styles = makeStyles(colors, 'light');
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{t('practice.errorTitle')}</Text>
      <Text style={styles.emptyText}>{message}</Text>
      <GameButton label={t('practice.tryAgain')} onPress={onRetry} />
      <Pressable onPress={() => { haptics.tap(); onBack(); }}>
        <Text style={styles.backLink}>{t('practice.backToPractice')}</Text>
      </Pressable>
    </View>
  );
}

function EmptyLevel({
  colors,
  t,
  section,
  onBack,
}: {
  colors: ThemeColors;
  t: (k: string, v?: Record<string, string | number>) => string;
  section: Section;
  onBack: () => void;
}) {
  const styles = makeStyles(colors, 'light');
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🔒</Text>
      <Text style={styles.emptyTitle}>{t('practice.emptyTitle')}</Text>
      <Text style={styles.emptyText}>{t('practice.emptyBody', { section: sectionLabel(section) })}</Text>
      <GameButton label={t('practice.backToPractice')} tone="purple" onPress={onBack} />
    </View>
  );
}

function Complete({
  colors,
  t,
  section,
  levelUp,
  onDone,
}: {
  colors: ThemeColors;
  t: (k: string, v?: Record<string, string | number>) => string;
  section: Section;
  levelUp: boolean;
  onDone: () => void;
}) {
  const styles = makeStyles(colors, 'light');
  return (
    <View style={styles.complete}>
      <Text style={styles.confetti}>✦  ✦  ✦</Text>
      <View style={styles.badge}>
        <Text style={{ fontSize: 46 }}>{levelUp ? '🏆' : '⚡'}</Text>
      </View>
      <Text style={styles.completeTitle}>{levelUp ? t('practice.levelComplete') : t('practice.sprintComplete')}</Text>
      <Text style={styles.completeCopy}>{levelUp ? t('practice.levelCompleteCopy') : t('practice.sprintCompleteCopy', { section: sectionLabel(section) })}</Text>
      <GameButton label={t('practice.backToDashboard')} onPress={onDone} />
    </View>
  );
}

function makeStyles(colors: ThemeColors, _scheme: 'light' | 'dark') {
  return StyleSheet.create({
    landing: { padding: 22, paddingTop: 31, paddingBottom: 28 },
    eyebrow: { color: colors.purple, fontSize: 11, fontWeight: '900', letterSpacing: 1.25 },
    landingTitle: { color: colors.text, fontWeight: '900', fontSize: 28, marginTop: 5 },
    landingLead: { color: colors.muted, fontSize: 15, lineHeight: 22, fontWeight: '600', marginTop: 8, marginBottom: 22 },
    sprint: { backgroundColor: colors.lavender, borderRadius: 25, padding: 22, marginBottom: 16 },
    sprintAlt: { backgroundColor: colors.line },
    sprintEyebrow: { color: colors.purple, fontWeight: '900', letterSpacing: 1.3, fontSize: 11 },
    sprintGlyph: { color: colors.purple, fontSize: 41, fontWeight: '900', marginVertical: 13 },
    sprintTitle: { color: colors.text, fontSize: 23, fontWeight: '900' },
    sprintMeta: { color: colors.muted, fontWeight: '700', marginTop: 5, marginBottom: 15 },
    root: { flex: 1, backgroundColor: colors.cloud },
    top: { paddingHorizontal: 17, paddingTop: 17, alignItems: 'center', flexDirection: 'row', gap: 12 },
    progressRail: { flex: 1, height: 11, backgroundColor: colors.line, borderRadius: 20, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.mint, borderRadius: 20 },
    count: { color: colors.muted, fontWeight: '900', fontSize: 12, width: 36, textAlign: 'right' },
    section: { color: colors.purple, letterSpacing: 1.4, fontWeight: '900', fontSize: 11, marginTop: 23, paddingHorizontal: 22 },
    questionScroll: { padding: 22, paddingTop: 10, paddingBottom: 20 },
    questionCard: { borderRadius: 21, borderWidth: 1.4, padding: 19, minHeight: 144, justifyContent: 'center' },
    stem: { color: colors.text, fontSize: 19, lineHeight: 28, fontWeight: '800' },
    choices: { gap: 10, marginTop: 19 },
    choice: { minHeight: 60, padding: 10, paddingRight: 13, borderRadius: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.white, gap: 11 },
    choiceActive: { borderColor: colors.purple, backgroundColor: colors.lavender },
    choiceCorrect: { borderColor: colors.mint, backgroundColor: _scheme === 'dark' ? '#123924' : '#E2FFF1' },
    choiceIncorrect: { borderColor: colors.coral, backgroundColor: _scheme === 'dark' ? '#3A1620' : '#FFE8EB' },
    letter: { width: 31, height: 31, borderRadius: 10, borderColor: colors.line, borderWidth: 1.4, alignItems: 'center', justifyContent: 'center' },
    letterActive: { backgroundColor: colors.purple, borderColor: colors.purple },
    letterCorrect: { backgroundColor: colors.mintDeep, borderColor: colors.mintDeep },
    letterIncorrect: { backgroundColor: colors.coralDeep, borderColor: colors.coralDeep },
    letterText: { color: colors.muted, fontWeight: '900', fontSize: 13 },
    choiceText: { color: colors.text, fontWeight: '700', fontSize: 15, flex: 1, lineHeight: 20 },
    explanationToggle: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 4 },
    explanationButton: { color: colors.purple, fontSize: 14, fontWeight: '900' },
    explanation: { backgroundColor: colors.lavender, borderRadius: 16, padding: 16 },
    explanationLabel: { color: colors.purple, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 6 },
    explanationText: { color: colors.text, lineHeight: 21, fontWeight: '600', fontSize: 14 },
    dock: { padding: 16, paddingBottom: 17, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line },
    feedback: { marginBottom: 9 },
    feedbackTitle: { fontWeight: '900', fontSize: 17 },
    feedbackSub: { color: colors.muted, fontWeight: '600', fontSize: 12, marginTop: 2 },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cloud },
    loadingText: { marginTop: 15, color: colors.muted, fontWeight: '700' },
    empty: { flex: 1, padding: 27, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.cloud },
    emptyEmoji: { fontSize: 44, marginBottom: 22 },
    emptyTitle: { color: colors.text, fontWeight: '900', fontSize: 27, textAlign: 'center' },
    emptyText: { color: colors.muted, fontWeight: '600', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 10, marginBottom: 18 },
    backLink: { color: colors.purple, fontWeight: '900', marginTop: 18 },
    complete: { flex: 1, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', padding: 28 },
    confetti: { color: colors.gold, fontWeight: '900', fontSize: 25, letterSpacing: 14, marginBottom: 17 },
    badge: { backgroundColor: colors.gold, width: 110, height: 110, borderRadius: 36, borderBottomWidth: 7, borderBottomColor: colors.goldShadow, alignItems: 'center', justifyContent: 'center' },
    completeTitle: { color: '#FFFFFF', fontSize: 31, fontWeight: '900', marginTop: 25 },
    completeCopy: { color: '#E1DDFF', textAlign: 'center', fontWeight: '600', lineHeight: 22, marginVertical: 18, fontSize: 15 },
  })
}