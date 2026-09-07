import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';
import { BackButton, GameButton, ScreenHeader } from '../../components/ui';
import { useTheme } from '../../core/theme-context';
import { ThemeColors } from '../../core/theme';
import { haptics } from '../../core/haptics';
import { Api } from '../../services/api';
import { StudyPath as StudyPathData, StudyPathNode, StudyLevelContent, StudyTab } from '../../core/types';

const PATH_AMPLITUDE = 90;
const PATH_ROW_HEIGHT = 138;
const PATH_MAX_NODE = 100;

// ---------- PATH (30-level ladder) ----------

export function StudyPath({ api, refreshToken, onOpenLevel }: { api: Api; refreshToken: number; onOpenLevel: (level: number) => void }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [data, setData] = useState<StudyPathData | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    api.getStudyPath().then(setData).catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not load your study path.'));
  }, [api]);
  useEffect(() => {
    load();
  }, [load, refreshToken]);

  if (error)
    return (
      <View style={styles.error}>
        <Text style={styles.errorTitle}>Couldn’t load your study path</Text>
        <Text style={styles.errorCopy}>{error}</Text>
        <GameButton label="Try again" onPress={load} />
      </View>
    );
  if (!data)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.purple} size="large" />
        <Text style={styles.loadingText}>Loading your study path…</Text>
      </View>
    );

  const nodes = data.nodes;
  const shifts = nodes.map((_, index) => Math.round(Math.sin((index * Math.PI) / 3) * PATH_AMPLITUDE));
  const pathWidth = PATH_AMPLITUDE * 2 + PATH_MAX_NODE + 40;
  const pathHeight = nodes.length * PATH_ROW_HEIGHT;
  const centerX = pathWidth / 2;
  const centers = shifts.map((shift, index) => ({ x: centerX + shift, y: index * PATH_ROW_HEIGHT + PATH_ROW_HEIGHT / 2 }));

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <ScreenHeader kicker="Путь обучения" title="Изучайте основы" />
      <Text style={styles.lead}>В каждом уровне до двух тем — Math и Grammar. Пройди обе (если есть Grammar), чтобы разблокировать следующий уровень.</Text>
      <View style={styles.legend}>
        <Legend colors={colors} state="complete" label="Пройден" />
        <Legend colors={colors} state="current" label="Текущий" />
        <Legend colors={colors} state="locked" label="Заблокирован" />
      </View>
      <View style={[styles.path, { width: pathWidth, height: pathHeight }]}>
        <Svg width={pathWidth} height={pathHeight} style={StyleSheet.absoluteFill}>
          {nodes.map((node, index) => {
            if (index === 0) return null;
            const unlocked = node.status !== 'locked';
            const from = centers[index - 1];
            const to = centers[index];
            return <Line key={node.sequenceLevel} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={unlocked ? colors.purple : colors.line} strokeWidth={10} strokeLinecap="round" />;
          })}
        </Svg>
        {nodes.map((node, index) => {
          const center = centers[index];
          const size = node.status === 'current' ? 100 : 88;
          return (
            <View key={node.sequenceLevel} style={{ position: 'absolute', left: center.x - size / 2, top: center.y - size / 2 }}>
              <LevelNode colors={colors} node={node} onPress={() => node.status !== 'locked' && onOpenLevel(node.sequenceLevel)} />
            </View>
          );
        })}
      </View>
      <Text style={styles.pathEnd}>More SAT superpowers are on the way ✨</Text>
    </ScrollView>
  );
}

function Legend({ colors, state, label }: { colors: ThemeColors; state: 'complete' | 'current' | 'locked'; label: string }) {
  const styles = makeStyles(colors);
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          state === 'complete' && { backgroundColor: colors.purple },
          state === 'current' && { backgroundColor: colors.gold, borderColor: colors.goldShadow },
          state === 'locked' && { backgroundColor: colors.line },
        ]}
      />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function LevelNode({ colors, node, onPress }: { colors: ThemeColors; node: StudyPathNode; onPress: () => void }) {
  const styles = makeStyles(colors);
  const pulse = useRef(new Animated.Value(1)).current;
  const pressDepth = useRef(new Animated.Value(0)).current;
  const current = node.status === 'current';
  const complete = node.status === 'completed';
  const locked = node.status === 'locked';

  useEffect(() => {
    if (!current) return;
    const animation = Animated.loop(
      Animated.sequence([Animated.timing(pulse, { toValue: 1.06, duration: 800, useNativeDriver: true }), Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true })])
    );
    animation.start();
    return () => animation.stop();
  }, [current, pulse]);

  const size = current ? 100 : 88;
  const depth = current ? 12 : 11;
  const topColor = complete ? colors.purple : current ? colors.gold : colors.line;
  const bottomColor = complete ? colors.purpleDeep : current ? colors.goldShadow : colors.muted;

  const handlePressIn = () => {
    haptics.tap();
    Animated.timing(pressDepth, { toValue: depth, duration: 70, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressDepth, { toValue: 0, useNativeDriver: true, friction: 4, tension: 160 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <Pressable disabled={locked} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ width: size, height: size + depth }}>
        <View style={[styles.puckShadow, { width: size, height: size, borderRadius: size / 2, top: depth, backgroundColor: bottomColor }]} />
        <Animated.View style={[styles.puckFace, { width: size, height: size, borderRadius: size / 2, backgroundColor: topColor, transform: [{ translateY: pressDepth }] }]}>
          {locked ? <LockIcon size={size * 0.32} /> : <Text style={[styles.nodeGlyph, { fontSize: size * 0.29 }]}>{complete ? '✓' : '★'}</Text>}
          <Text style={[styles.nodeNumber, { bottom: size * 0.1 }, current && { color: colors.ink }, locked && { color: colors.muted }]}>{node.sequenceLevel}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function LockIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5" stroke="#FFFFFF" strokeWidth={2.3} strokeLinecap="round" fill="none" />
      <Rect x="5" y="10.5" width="14" height="9.5" rx="2.6" fill="#FFFFFF" />
    </Svg>
  );
}

// ---------- LESSON (scenarios -> quiz, one question at a time, per tab) ----------

type Stage = 'overview' | 'scenario' | 'quiz' | 'tabDone';

export function StudyLesson({ api, level, onClose }: { api: Api; level: number; onClose: () => void }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [node, setNode] = useState<StudyPathNode | null>(null);
  const [mathDone, setMathDone] = useState(false);
  const [grammarDone, setGrammarDone] = useState(false);
  const [pathError, setPathError] = useState('');

  const [tab, setTab] = useState<StudyTab>('math');
  const [content, setContent] = useState<StudyLevelContent | null>(null);
  const [contentError, setContentError] = useState('');
  const [stage, setStage] = useState<Stage>('overview');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answer, setAnswer] = useState<{ correct: boolean; correctChoice: string | null; explanation: string | null } | null>(null);
  const [justLeveledUp, setJustLeveledUp] = useState(false);

  const loadPath = useCallback(() => {
    setPathError('');
    api
      .getStudyPath()
      .then((data) => {
        const found = data.nodes.find((n) => n.sequenceLevel === level) ?? null;
        setNode(found);
        const isCurrent = found?.status === 'current';
        setMathDone(found?.status === 'completed' || Boolean(isCurrent && data.mathTabDone));
        setGrammarDone(found?.status === 'completed' || Boolean(isCurrent && data.grammarTabDone));
      })
      .catch((caught) => setPathError(caught instanceof Error ? caught.message : 'Could not load this level.'));
  }, [api, level]);
  useEffect(() => {
    loadPath();
  }, [loadPath]);

  const loadContent = useCallback(
    (selectedTab: StudyTab) => {
      setContentError('');
      setContent(null);
      setStage('overview');
      setScenarioIndex(0);
      setQuizIndex(0);
      setSelected(null);
      setAnswer(null);
      api
        .getStudyLevel(level, selectedTab)
        .then(setContent)
        .catch((caught) => setContentError(caught instanceof Error ? caught.message : 'Could not open this lesson.'));
    },
    [api, level]
  );
  useEffect(() => {
    loadContent(tab);
  }, [loadContent, tab]);

  if (pathError)
    return (
      <View style={styles.error}>
        <Text style={styles.errorTitle}>Couldn’t open this level</Text>
        <Text style={styles.errorCopy}>{pathError}</Text>
        <GameButton label="Try again" onPress={loadPath} />
      </View>
    );
  if (!node)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.purple} size="large" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  if (contentError)
    return (
      <View style={styles.error}>
        <Text style={styles.errorTitle}>Couldn’t open this lesson</Text>
        <Text style={styles.errorCopy}>{contentError}</Text>
        <GameButton label="Try again" onPress={() => loadContent(tab)} />
      </View>
    );
  if (!content)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.purple} size="large" />
        <Text style={styles.loadingText}>Opening lesson…</Text>
      </View>
    );

  const startQuiz = () => {
    haptics.tap();
    setStage('quiz');
    setQuizIndex(0);
    setSelected(null);
    setAnswer(null);
  };

  const nextScenario = () => {
    haptics.tap();
    if (scenarioIndex === content.scenarios.length - 1) {
      startQuiz();
      return;
    }
    setScenarioIndex((v) => v + 1);
  };

  const checkAnswer = async () => {
    if (!selected) return;
    const question = content.quiz[quizIndex];
    try {
      const result = await api.submitStudyAnswer(level, tab, question.id, selected);
      setAnswer({ correct: result.correct, correctChoice: result.correctChoice, explanation: result.explanation });
      if (result.correct) {
        haptics.success();
        if (result.tabCompleted) {
          if (tab === 'math') setMathDone(true);
          else setGrammarDone(true);
        }
        if (result.leveledUp) setJustLeveledUp(true);
      } else {
        haptics.error();
      }
    } catch (caught) {
      setContentError(caught instanceof Error ? caught.message : 'Could not save your answer.');
    }
  };

  const nextQuizQuestion = () => {
    haptics.tap();
    if (!answer?.correct) return;
    const wasLast = quizIndex === content.quiz.length - 1;
    if (wasLast) {
      setStage('tabDone');
      return;
    }
    setQuizIndex((v) => v + 1);
    setSelected(null);
    setAnswer(null);
  };

  const retry = () => {
    haptics.tap();
    setSelected(null);
    setAnswer(null);
  };

  // ---- QUIZ ----
  if (stage === 'quiz') {
    const question = content.quiz[quizIndex];
    return (
      <View style={styles.lessonRoot}>
        <View style={styles.lessonTop}>
          <BackButton onPress={() => setStage('overview')} />
          <Text style={styles.levelLabel}>
            QUIZ {quizIndex + 1} OF {content.quiz.length}
          </Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={styles.quizScroll}>
          <Text style={styles.quizStem}>{question.stem}</Text>
          {question.choices.map((choice) => (
            <Pressable
              key={choice.id}
              disabled={Boolean(answer)}
              onPress={() => {
                haptics.select();
                setSelected(choice.id);
              }}
              style={[
                styles.quizChoice,
                selected === choice.id && styles.quizChoiceActive,
                selected === choice.id && Boolean(answer?.correct) && styles.quizCorrect,
                selected === choice.id && Boolean(answer) && !answer?.correct && styles.quizIncorrect,
              ]}
            >
              <View style={[styles.quizLetter, selected === choice.id && styles.quizLetterActive]}>
                <Text style={[styles.quizLetterText, selected === choice.id && { color: '#FFFFFF' }]}>{choice.id}</Text>
              </View>
              <Text style={styles.quizChoiceText}>{choice.text}</Text>
            </Pressable>
          ))}
          {answer && !answer.correct ? (
            <View style={styles.explanation}>
              <Text style={styles.explanationLabel}>CORRECT ANSWER: {answer.correctChoice}</Text>
              <Text style={styles.explanationText}>{answer.explanation}</Text>
            </View>
          ) : null}
          {answer?.correct ? <Text style={[styles.feedback, { color: colors.mintDeep }]}>Correct — nice work!</Text> : null}
        </ScrollView>
        <View style={styles.dock}>
          <GameButton
            label={answer ? (answer.correct ? (quizIndex === content.quiz.length - 1 ? 'Finish' : 'Next question') : 'Try again') : 'Check answer'}
            disabled={!selected}
            tone={answer?.correct ? 'mint' : answer && !answer.correct ? 'coral' : 'gold'}
            onPress={answer ? (answer.correct ? nextQuizQuestion : retry) : checkAnswer}
          />
        </View>
      </View>
    );
  }

  // ---- SCENARIO (sequential explanation, one card at a time) ----
  if (stage === 'scenario') {
    const scenario = content.scenarios[scenarioIndex];
    return (
      <View style={styles.lessonRoot}>
        <View style={styles.lessonTop}>
          <BackButton onPress={() => setStage('overview')} />
          <Text style={styles.levelLabel}>
            {scenarioIndex + 1} OF {content.scenarios.length}
          </Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={styles.lessonScroll}>
          <Text style={styles.lessonKicker}>
            {tab.toUpperCase()} · STEP {scenarioIndex + 1}
          </Text>
          <Text style={styles.lessonTitle}>{scenario.title}</Text>
          <Text style={styles.lessonBody}>{scenario.content}</Text>
        </ScrollView>
        <View style={styles.dock}>
          <GameButton label={scenarioIndex === content.scenarios.length - 1 ? 'Start quiz' : 'Next'} onPress={nextScenario} />
        </View>
      </View>
    );
  }

  // ---- TAB DONE ----
  if (stage === 'tabDone') {
    const bothDone = mathDone && (grammarDone || !node.hasGrammarTab);
    return (
      <View style={styles.lessonRoot}>
        <View style={styles.lessonTop}>
          <BackButton onPress={onClose} />
          <Text style={styles.levelLabel}>LEVEL {level}</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.lessonScroll}>
          <View style={styles.passed}>
            <Text style={styles.passedText}>✓ {tab.toUpperCase()} DONE</Text>
          </View>
          {justLeveledUp ? <Text style={[styles.lessonTitle, { fontSize: 24, marginTop: 18 }]}>Level {level} complete! 🎉</Text> : null}
          {!bothDone && node.hasGrammarTab ? (
            <Text style={styles.lessonBody}>Finish the other tab to unlock level {level + 1}.</Text>
          ) : (
            <Text style={styles.lessonBody}>Great work — head back to your path.</Text>
          )}
        </View>
        <View style={styles.dock}>
          <GameButton label="Back to path" onPress={onClose} />
        </View>
      </View>
    );
  }

  // ---- OVERVIEW (tab picker) ----
  return (
    <View style={styles.lessonRoot}>
      <View style={styles.lessonTop}>
        <BackButton onPress={onClose} />
        <Text style={styles.levelLabel}>LEVEL {level}</Text>
        <View style={{ width: 36 }} />
      </View>
      {node.hasGrammarTab ? (
        <View style={styles.tabs}>
          <SectionTab
            colors={colors}
            active={tab === 'math'}
            label={`Math ${mathDone ? '✓' : ''}`}
            onPress={() => {
              haptics.select();
              setTab('math');
            }}
          />
          <SectionTab
            colors={colors}
            active={tab === 'grammar'}
            label={`Grammar ${grammarDone ? '✓' : ''}`}
            onPress={() => {
              haptics.select();
              setTab('grammar');
            }}
          />
        </View>
      ) : null}
      <ScrollView contentContainerStyle={styles.lessonScroll}>
        <View style={[styles.lessonGlyph, { backgroundColor: tab === 'math' ? '#E4DFFF' : '#FFE7BA' }]}>
          <Text style={{ fontSize: 31 }}>{tab === 'math' ? '∑' : '✎'}</Text>
        </View>
        <Text style={styles.lessonKicker}>{tab.toUpperCase()} · LESSON</Text>
        <Text style={styles.lessonTitle}>{content.topic}</Text>
        <View style={{ marginTop: 25 }}>
          {(tab === 'math' ? mathDone : grammarDone) ? (
            <View style={styles.passed}>
              <Text style={styles.passedText}>✓ DONE</Text>
            </View>
          ) : (
            <GameButton
              label="Start lesson"
              onPress={() => {
                haptics.tap();
                setStage('scenario');
                setScenarioIndex(0);
              }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SectionTab({ colors, active, label, onPress }: { colors: ThemeColors; active: boolean; label: string; onPress: () => void }) {
  const styles = makeStyles(colors);
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    scroll: { padding: 22, paddingTop: 31, paddingBottom: 40 },
    lead: { color: colors.muted, fontSize: 15, lineHeight: 22, fontWeight: '600', marginTop: -5, marginBottom: 22 },
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 12, borderRadius: 14, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, marginBottom: 20 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendDot: { width: 11, height: 11, borderRadius: 6, borderWidth: 1 },
    legendText: { color: colors.muted, fontWeight: '800', fontSize: 11 },
    path: { alignSelf: 'center' },
    puckShadow: { position: 'absolute', left: 0 },
    puckFace: { position: 'absolute', top: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
    nodeGlyph: { color: colors.white, fontWeight: '900' },
    nodeNumber: { color: colors.white, fontWeight: '900', fontSize: 12, position: 'absolute' },
    pathEnd: { color: colors.muted, fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 12 },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cloud },
    loadingText: { marginTop: 15, color: colors.muted, fontWeight: '700' },
    error: { flex: 1, justifyContent: 'center', padding: 26, backgroundColor: colors.cloud },
    errorTitle: { color: colors.text, fontWeight: '900', fontSize: 23 },
    errorCopy: { color: colors.muted, fontWeight: '600', lineHeight: 22, marginTop: 8, marginBottom: 15 },
    lessonRoot: { flex: 1, backgroundColor: colors.cloud },
    lessonTop: { paddingHorizontal: 17, paddingTop: 16, paddingBottom: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    levelLabel: { color: colors.purple, fontWeight: '900', fontSize: 12, letterSpacing: 1.2 },
    tabs: { flexDirection: 'row', marginHorizontal: 17, backgroundColor: colors.line, borderRadius: 14, padding: 4, gap: 4 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
    tabActive: { backgroundColor: colors.white },
    tabText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
    tabTextActive: { color: colors.purple },
    lessonScroll: { padding: 23, paddingTop: 30, paddingBottom: 40 },
    lessonGlyph: { height: 65, width: 65, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    lessonKicker: { color: colors.purple, fontWeight: '900', fontSize: 11, letterSpacing: 1.25 },
    lessonTitle: { color: colors.text, fontWeight: '900', fontSize: 30, lineHeight: 35, marginTop: 6 },
    lessonBody: { color: colors.text, fontSize: 16, lineHeight: 25, fontWeight: '600', marginTop: 17 },
    passed: { alignSelf: 'center', backgroundColor: '#DDFBEA', borderRadius: 13, paddingHorizontal: 15, paddingVertical: 10 },
    passedText: { color: colors.mintDeep, fontWeight: '900', fontSize: 12, letterSpacing: 0.4 },
    quizScroll: { padding: 22, gap: 10 },
    quizStem: { color: colors.text, fontSize: 19, lineHeight: 28, fontWeight: '800', marginBottom: 10 },
    quizChoice: { minHeight: 60, padding: 10, paddingRight: 13, borderRadius: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.white, gap: 11 },
    quizChoiceActive: { borderColor: colors.purple, backgroundColor: colors.lavender },
    quizCorrect: { borderColor: colors.mint, backgroundColor: '#E2FFF1' },
    quizIncorrect: { borderColor: colors.coral, backgroundColor: '#FFE8EB' },
    quizLetter: { width: 31, height: 31, borderRadius: 10, borderColor: colors.line, borderWidth: 1.4, alignItems: 'center', justifyContent: 'center' },
    quizLetterActive: { backgroundColor: colors.purple, borderColor: colors.purple },
    quizLetterText: { color: colors.muted, fontWeight: '900', fontSize: 13 },
    quizChoiceText: { color: colors.text, fontWeight: '700', fontSize: 15, flex: 1, lineHeight: 20 },
    feedback: { fontSize: 16, fontWeight: '900', marginTop: 12 },
    explanation: { backgroundColor: colors.lavender, borderRadius: 16, padding: 16, marginTop: 12 },
    explanationLabel: { color: colors.purple, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 6 },
    explanationText: { color: colors.text, lineHeight: 21, fontWeight: '600', fontSize: 14 },
    dock: { padding: 16, paddingBottom: 17, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line },
  });
}