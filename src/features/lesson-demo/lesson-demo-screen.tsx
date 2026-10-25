import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Section } from '../../core/types';
import { LESSONS } from './lesson-data';
import { ExplainView, FinishView } from './result-views';
import { TaskView } from './task-view';
import { useLessonAnimations, useLessonSession } from './use-lesson';

/**
 * ТЕСТОВЫЙ урок в стиле Duolingo, для математики и грамматики. Вопросы лежат в data/ и заведены вручную.
 * С бэком экран пока не связан, ответы никуда не отправляются.
 *
 * Файлы рядом:
 *  - lesson-data.ts: типы заданий, сами задания (математика, грамматика) и выбор набора по разделу;
 *  - lesson-ui.tsx: цвета, общие стили, кнопка и пружинящая плитка;
 *  - use-lesson.ts: логика прохождения (useLessonSession) и анимации (useLessonAnimations);
 *  - task-view.tsx: экран задания, шапка с прогрессом и панель результата;
 *  - result-views.tsx: экран "Объяснение ошибки" и итог урока.
 * Этот файл только собирает всё вместе и решает, какой вид показать.
 */
export function LessonDemoScreen({ section, onClose }: { section: Section; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 16) + 8;

  const session = useLessonSession(LESSONS[section]);
  const anim = useLessonAnimations({
    index: session.index,
    status: session.status,
    finished: session.finished,
    progress: session.progress,
  });

  if (session.finished) return <FinishView session={session} anim={anim} bottomPad={bottomPad} onClose={onClose} />;
  if (session.showExplain) return <ExplainView session={session} bottomPad={bottomPad} />;
  return <TaskView section={section} session={session} anim={anim} bottomPad={bottomPad} onClose={onClose} />;
}