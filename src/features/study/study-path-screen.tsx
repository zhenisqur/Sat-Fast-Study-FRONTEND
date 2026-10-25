import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { GameButton } from '../../components/ui';
import { useTheme } from '../../core/theme-context';
import { haptics } from '../../core/haptics';
import { useTabBarInset } from '../../core/tab-bar';
import { Api } from '../../services/api';
import { StudyPath as StudyPathData } from '../../core/types';
import {
  CARD_OFFSET_BELOW_CENTER, CARD_SIDE_MARGIN, DEMO_STATS, MODULE_MASCOTS, MODULE_MASCOT_BELOW_FIRST, MODULE_MASCOT_SCREEN_LEFT,
  MODULE_SIZE, NODE_SIZE, moduleMascotSize, moduleTheme, PATH_AMPLITUDE, PATH_MAX_NODE, PATH_TOP_MARGIN,
  SCROLL_TARGET_FROM_TOP, UNLOCK_GAP, UNLOCK_WIDTH, initialModules, isModuleComplete, layoutCenters, nodeSegments, shortTopic,
  topicTitle,
} from './path-layout';
import { LevelNode, PathRoad, PopIn, RevealIn, StatPill, UnlockButton } from './path-parts';
import { makeStyles } from './study-styles';

// ---------- PATH (30-level ladder) ----------

export function StudyPath({ api, refreshToken, onOpenLevel }: { api: Api; refreshToken: number; onOpenLevel: (level: number) => void }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [data, setData] = useState<StudyPathData | null>(null);
  const [error, setError] = useState('');
  // Контент прокручивается под парящую панель вкладок, поэтому снизу оставляем запас.
  const bottomInset = useTabBarInset();
  const { width: screenWidth } = useWindowDimensions();
  // Номер уровня, у которого сейчас открыта карточка с кнопкой «Начать».
  const [openLevel, setOpenLevel] = useState<number | null>(null);
  // Уровень последней открытой карточки. После закрытия карточка остаётся на экране с этим уровнем,
  // пока не доиграет анимация исчезновения, и только потом убирается.
  const lastCardLevel = useRef<number | null>(null);
  const [, redraw] = useState(0);
  if (openLevel !== null) lastCardLevel.current = openLevel;
  // При открытии экрана прокручиваем к текущему узлу (один раз за показ экрана).
  const scrollRef = useRef<ScrollView>(null);
  const didScroll = useRef(false);
  const headerHeight = useRef(150);
  // Модули по MODULE_SIZE узлов: сколько сейчас открыто и какой открыли только что (его узлы появляются с анимацией).
  const [modulesShown, setModulesShown] = useState(1);
  const [justRevealed, setJustRevealed] = useState<number | null>(null);

  const load = useCallback(() => {
    setError('');
    api
      .getStudyPath()
      .then((next) => {
        setData(next);
        // Открытые модули после перезагрузки данных не прячем обратно.
        setModulesShown((value) => Math.max(value, initialModules(next.nodes)));
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not load your study path.'));
  }, [api]);
  useEffect(() => {
    load();
    setOpenLevel(null);
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

  // Показываем только открытые модули. Всё, что дальше, скрыто за кнопкой РАЗБЛОКИРОВАТЬ.
  const allNodes = data.nodes;
  const totalModules = Math.ceil(allNodes.length / MODULE_SIZE);
  const shownModules = Math.min(modulesShown, totalModules);
  const nodes = allNodes.slice(0, shownModules * MODULE_SIZE);
  const hasHiddenModules = shownModules < totalModules;
  const lastShownDone = isModuleComplete(allNodes, shownModules - 1);
  const pathWidth = PATH_AMPLITUDE * 2 + PATH_MAX_NODE + 40;
  const centerX = pathWidth / 2;
  const centers = layoutCenters(nodes, centerX);
  const lastCenter = centers[centers.length - 1];
  const unlockY = (lastCenter ? lastCenter.y : 0) + UNLOCK_GAP;
  const pathHeight = hasHiddenModules ? unlockY + 70 : (lastCenter ? lastCenter.y : 0) + 90;
  // Дорога идёт через видимые узлы и заканчивается на последнем. Кнопка РАЗБЛОКИРОВАТЬ стоит ниже отдельно и дорогу не задевает.
  const roadPoints = centers;
  const bannerNode = allNodes.find((n) => n.status === 'current') ?? allNodes[allNodes.length - 1];
  // Баннер красится в цвет модуля, в котором сейчас текущий узел.
  const bannerTheme = moduleTheme(bannerNode ? Math.floor(allNodes.indexOf(bannerNode) / MODULE_SIZE) : -1);
  const bannerLevel = bannerNode?.sequenceLevel ?? 1;
  // Путь по центру экрана, поэтому левый край экрана лежит на (ширина экрана - ширина пути) / 2 левее пути.
  const pathLeft = (screenWidth - pathWidth) / 2;
  // Карточка под узлом: во всю ширину экрана с полями, хвостик показывает на узел.
  const cardLevel = openLevel ?? lastCardLevel.current;
  const cardIndex = cardLevel === null ? -1 : nodes.findIndex((n) => n.sequenceLevel === cardLevel && n.status === 'current');
  const cardNode = cardIndex >= 0 ? nodes[cardIndex] : null;
  const cardCenter = cardIndex >= 0 ? centers[cardIndex] : null;
  const cardLeft = CARD_SIDE_MARGIN - pathLeft;
  const cardSegments = cardNode ? nodeSegments(cardNode, data) : { total: 1, done: 0 };

  return (
    <ScrollView
      ref={scrollRef}
      onContentSizeChange={() => {
        if (didScroll.current) return;
        didScroll.current = true;
        const currentIndex = nodes.findIndex((n) => n.status === 'current');
        if (currentIndex < 2) return;
        const y = headerHeight.current + PATH_TOP_MARGIN + centers[currentIndex].y - SCROLL_TARGET_FROM_TOP;
        scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: false });
      }}
      stickyHeaderIndices={[0]}
      onScrollBeginDrag={() => setOpenLevel(null)}
      contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset }]}
      scrollIndicatorInsets={{ bottom: bottomInset - 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={styles.sticky}
        onPress={() => setOpenLevel(null)}
        onLayout={(e) => {
          headerHeight.current = e.nativeEvent.layout.height;
        }}
      >
        <View style={styles.statsRow}>
          <StatPill colors={colors} icon="flag" color={colors.purple} value={`Ур. ${bannerLevel}`} />
          <StatPill colors={colors} icon="flame" color="#FF9F43" value={String(DEMO_STATS.streak)} />
          <StatPill colors={colors} icon="flash" color={colors.gold} value={String(DEMO_STATS.xp)} />
        </View>
        <View style={[styles.banner, bannerTheme && { backgroundColor: bannerTheme.color, borderBottomColor: bannerTheme.shadow }]}>
          <Text style={styles.bannerKicker}>УРОВЕНЬ {bannerLevel}</Text>
          <Text style={styles.bannerTitle} numberOfLines={1}>{bannerNode ? topicTitle(bannerNode) : 'Изучайте основы'}</Text>
        </View>
      </Pressable>
      <View style={[styles.path, { width: pathWidth, height: pathHeight }]}>
        {/* Маскоты модулей: слева от дороги, под 1-м узлом модуля. Лежат под дорогой, чтобы фон картинки её не перекрывал. */}
        {Array.from({ length: shownModules }, (_, moduleIndex) => {
          const source = MODULE_MASCOTS[moduleIndex];
          const anchor = centers[moduleIndex * MODULE_SIZE];
          if (!source || !anchor) return null;
          const size = moduleMascotSize(source);
          return (
            <View
              key={`mascot-${moduleIndex}`}
              pointerEvents="none"
              style={{ position: 'absolute', left: MODULE_MASCOT_SCREEN_LEFT - pathLeft, top: anchor.y + MODULE_MASCOT_BELOW_FIRST }}
            >
              <Image source={source} resizeMode="contain" style={{ width: size.width, height: size.height }} />
            </View>
          );
        })}
        <PathRoad points={roadPoints} width={pathWidth} height={pathHeight} />
        {cardNode && openLevel !== null ? (
          <Pressable
            onPress={() => setOpenLevel(null)}
            style={{ position: 'absolute', left: -pathLeft, top: -PATH_TOP_MARGIN, width: screenWidth, height: pathHeight + PATH_TOP_MARGIN + 160 }}
          />
        ) : null}
        {nodes.map((node, index) => {
          const center = centers[index];
          const size = NODE_SIZE;
          const moduleIndex = Math.floor(index / MODULE_SIZE);
          return (
            <View key={node.sequenceLevel} style={{ position: 'absolute', left: center.x - size / 2, top: center.y - size / 2 }}>
              <RevealIn enabled={moduleIndex === justRevealed} delay={(index % MODULE_SIZE) * 120}>
              <LevelNode colors={colors} node={node} accent={moduleTheme(moduleIndex)} segments={nodeSegments(node, data)} open={openLevel === node.sequenceLevel} onPress={() => {
                if (node.status === 'locked') return;
                // Текущий узел сначала открывает карточку, остальные открываются сразу, как раньше.
                if (node.status === 'current') setOpenLevel((value) => (value === node.sequenceLevel ? null : node.sequenceLevel));
                else onOpenLevel(node.sequenceLevel);
              }} />
              </RevealIn>
            </View>
          );
        })}
        {hasHiddenModules ? (
          <View style={{ position: 'absolute', left: centerX - UNLOCK_WIDTH / 2, top: unlockY - 29 }}>
            <UnlockButton
              width={UNLOCK_WIDTH}
              ready={lastShownDone}
              onPress={() => {
                haptics.success();
                setOpenLevel(null);
                setJustRevealed(shownModules);
                setModulesShown(shownModules + 1);
                // Прокручиваем так, чтобы новый модуль оказался на экране.
                const y = headerHeight.current + PATH_TOP_MARGIN + unlockY - SCROLL_TARGET_FROM_TOP;
                setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true }), 60);
              }}
            />
          </View>
        ) : null}
        {cardNode && cardCenter ? (
          <PopIn visible={openLevel !== null} onHidden={() => {
            if (openLevel !== null) return;
            lastCardLevel.current = null;
            redraw((value) => value + 1);
          }} style={[styles.card, { top: cardCenter.y + CARD_OFFSET_BELOW_CENTER, left: cardLeft, width: screenWidth - CARD_SIDE_MARGIN * 2 }]}>
            <View style={[styles.cardTail, { left: cardCenter.x - cardLeft - 8 }]} />
            <Text style={styles.cardTitle} numberOfLines={1}>{topicTitle(cardNode)}</Text>
            {shortTopic(cardNode.grammarTopic) ? <Text style={styles.cardSub} numberOfLines={1}>+ {shortTopic(cardNode.grammarTopic)}</Text> : null}
            <Text style={styles.cardSub}>Часть {Math.min(cardSegments.done + 1, cardSegments.total)} из {cardSegments.total}</Text>
            <Pressable
              onPress={() => {
                haptics.tap();
                setOpenLevel(null);
                onOpenLevel(cardNode.sequenceLevel);
              }}
              style={({ pressed }) => [styles.cardButton, pressed && styles.cardButtonPressed]}
            >
              <Text style={styles.cardButtonText}>НАЧАТЬ</Text>
            </Pressable>
          </PopIn>
        ) : null}
      </View>
    </ScrollView>
  );
}