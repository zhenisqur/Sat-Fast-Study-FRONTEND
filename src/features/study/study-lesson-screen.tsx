import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { BackButton, GameButton } from '../../components/ui';
import { useTheme } from '../../core/theme-context';
import { ThemeColors } from '../../core/theme';
import { haptics } from '../../core/haptics';
import { Api } from '../../services/api';
import { StudyLevelContent, StudyPathNode, StudyTab } from '../../core/types';
import { makeStyles } from './study-styles';

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